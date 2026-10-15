"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/email/resend";
import { ownerAlert, visitorReceipt, type LeadEmailData } from "@/lib/email/templates";
import {
  checkLeadRateLimit,
  generateReferenceCode,
  normalizePhone,
} from "@/lib/lead/rate-limit";
import { createPublicClient, createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import {
  fieldErrorsFrom,
  leadFormSchema,
  parseLeadForm,
  type LeadFormState,
} from "@/lib/validation/lead";

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return true;
  }
  if (!token) {
    return false;
  }

  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("[lead] turnstile verify failed:", error);
    return false;
  }
}

async function recordEvent(
  service: ReturnType<typeof createServiceClient>,
  event: {
    lead_id: string;
    event_type: string;
    body?: string;
    metadata?: Json;
  },
): Promise<void> {
  const { error } = await service.from("lead_events").insert(event);
  if (error) {
    console.error("[lead] event insert failed:", event.event_type, error.message);
  }
}

export async function submitLead(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  // 1. Honeypot: pretend success, insert nothing.
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot !== "") {
    return { ok: true, code: "submitted", referenceCode: generateReferenceCode() };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";

  // 2. Turnstile, only when the secret key exists.
  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return {
      ok: false,
      code: "server_error",
      message: "The security check did not pass. Please try again.",
    };
  }

  // 3. In-memory rate limit, before validation so junk still counts.
  const phoneRaw = String(formData.get("phone") ?? "");
  const rate = checkLeadRateLimit(phoneRaw, ip);
  if (!rate.ok) {
    return {
      ok: false,
      code: "rate_limited",
      message:
        rate.scope === "phone"
          ? "That is three requests in ten minutes. Please call instead."
          : "Too many requests from this connection. Please call instead.",
    };
  }

  // 4. Authoritative validation with the shared schema.
  const parsed = leadFormSchema.safeParse(parseLeadForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid",
      fieldErrors: fieldErrorsFrom(parsed.error),
      message: "Check the highlighted fields.",
    };
  }
  const input = parsed.data;

  const supabase = createPublicClient();

  // 5. Zip re-check on the server. Never blocks; the zip is stored as typed.
  const { data: areas } = await supabase
    .from("service_areas")
    .select("zip_codes")
    .eq("is_active", true);
  const outsideArea =
    Array.isArray(areas) &&
    !areas.some((area) => area.zip_codes.includes(input.zip));

  // 6. Duplicate guard with the service role key (server only).
  const service = createServiceClient();
  const normalizedPhone = normalizePhone(input.phone);
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
  const { data: recent, error: recentError } = await service
    .from("leads")
    .select("id, reference_code, phone")
    .gte("created_at", since);

  if (!recentError && Array.isArray(recent)) {
    const duplicate = recent.find(
      (lead) =>
        typeof lead.reference_code === "string" &&
        lead.reference_code !== "" &&
        normalizePhone(lead.phone) === normalizedPhone,
    );
    if (duplicate && duplicate.reference_code) {
      await recordEvent(service, {
        lead_id: duplicate.id,
        event_type: "duplicate_submission",
        body: `Second submission from ${input.phone} within ten minutes of the original. Payload recorded, no new lead created.`,
        metadata: {
          kind: input.kind,
          name: input.name,
          zip: input.zip,
          reference_code: duplicate.reference_code,
        },
      });
      return {
        ok: true,
        code: "duplicate",
        referenceCode: duplicate.reference_code,
        message: `We already have your request from the last ten minutes. Your reference stays ${duplicate.reference_code} — no need to send it twice.`,
      };
    }
  }

  // 7. Insert with an action generated reference code. No .select() after
  //    the insert: the row id and reference code are known up front, and RLS
  //    keeps status pinned to "new".
  const leadId = randomUUID();
  let referenceCode = generateReferenceCode();
  let lastInsertError: { code?: string; message: string } | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { error } = await supabase.from("leads").insert({
      id: leadId,
      status: "new",
      reference_code: referenceCode,
      kind: input.kind,
      name: input.name,
      phone: input.phone,
      zip: input.zip,
      email: input.email || null,
      address: input.address || null,
      issue: input.issue || null,
      preferred_day: input.preferred_day || null,
      preferred_window: input.preferred_window || null,
      consent_email: input.consent_email,
      consent_sms: false,
      consent_at: input.consent_email ? new Date().toISOString() : null,
      consent_version: input.consent_email ? "v1" : null,
      utm_source: input.utm_source || null,
      utm_medium: input.utm_medium || null,
      utm_campaign: input.utm_campaign || null,
    });

    if (!error) {
      lastInsertError = null;
      break;
    }
    lastInsertError = { code: error.code, message: error.message };
    const isReferenceCollision =
      error.code === "23505" && error.message.includes("reference_code");
    if (!isReferenceCollision) {
      break;
    }
    referenceCode = generateReferenceCode();
  }

  if (lastInsertError) {
    console.error("[lead] insert failed:", lastInsertError.message);
    return {
      ok: false,
      code: "server_error",
      message: "Something went wrong on our side. Please call instead.",
    };
  }

  // 8. Emails, best effort. The lead is already saved either way.
  const leadForEmail: LeadEmailData = {
    id: leadId,
    referenceCode,
    kind: input.kind,
    name: input.name,
    phone: input.phone,
    zip: input.zip,
    email: input.email || null,
    address: input.address || null,
    issue: input.issue || null,
    preferredDay: input.preferred_day || null,
    preferredWindow: input.preferred_window || null,
    consentEmail: input.consent_email,
    createdAt: new Date().toISOString(),
    outsideArea,
  };
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  const notifyTo = process.env.LEAD_NOTIFY_EMAIL;
  if (notifyTo) {
    const alert = ownerAlert(leadForEmail, siteUrl);
    const result = await sendEmail({
      to: notifyTo,
      subject: alert.subject,
      html: alert.html,
      text: alert.text,
      idempotencyKey: `lead-alert/${leadId}`,
    });
    if (result.ok) {
      await recordEvent(service, {
        lead_id: leadId,
        event_type: "email_sent",
        body: "Owner alert sent.",
        metadata: { to: notifyTo, subject: alert.subject, kind: "owner_alert" },
      });
    } else if ("error" in result) {
      await recordEvent(service, {
        lead_id: leadId,
        event_type: "note",
        body: `Owner alert failed: ${result.error}`,
        metadata: { to: notifyTo },
      });
    }
  }

  if (leadForEmail.email) {
    const receipt = visitorReceipt(leadForEmail, siteUrl);
    const result = await sendEmail({
      to: leadForEmail.email,
      subject: receipt.subject,
      html: receipt.html,
      text: receipt.text,
      replyTo: notifyTo,
      idempotencyKey: `lead-receipt/${leadId}`,
    });
    if (result.ok) {
      await recordEvent(service, {
        lead_id: leadId,
        event_type: "email_sent",
        body: "Visitor receipt sent.",
        metadata: {
          to: leadForEmail.email,
          subject: receipt.subject,
          kind: "visitor_receipt",
        },
      });
    }
  }

  // 9. Done.
  return {
    ok: true,
    code: "submitted",
    referenceCode,
    message:
      "Request received. The owner reviews it personally and confirms by phone, usually the same day.",
  };
}
