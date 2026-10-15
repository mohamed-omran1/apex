"use server";

import { redirect } from "next/navigation";
import { createSessionClient, isAdminUser } from "@/lib/supabase/server";
import { offerSchema, settingsPatchSchema } from "@/lib/validation/settings";
import {
  leadTransitions,
  type AdminFormState,
  type LeadStatus,
} from "@/lib/admin/transitions";

function fieldErrorsFrom(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}

async function requireAdmin() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) {
    return null;
  }
  return { supabase, user };
}

/**
 * Move a lead to a new status and write the event. Legal transitions only;
 * the allow list lives in this module and is the single source.
 */
export async function updateLeadStatus(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const auth = await requireAdmin();
  if (!auth) {
    return { ok: false, code: "not_admin", message: "This account does not have admin access." };
  }

  const leadId = String(formData.get("lead_id") ?? "");
  const nextStatusRaw = String(formData.get("status") ?? "");

  if (!leadId || !nextStatusRaw) {
    return { ok: false, code: "invalid", message: "Missing lead or status." };
  }
  if (!(nextStatusRaw in leadTransitions)) {
    return { ok: false, code: "invalid", message: "Unknown status." };
  }
  const nextStatus = nextStatusRaw as LeadStatus;

  const { supabase, user } = auth;
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, status")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError || !lead) {
    return { ok: false, code: "not_found", message: "That lead is not here." };
  }

  const currentStatus = lead.status as LeadStatus;
  const allowed = leadTransitions[currentStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    return {
      ok: false,
      code: "invalid",
      message: `Cannot move a ${currentStatus} lead to ${nextStatus}.`,
    };
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update({ status: nextStatus })
    .eq("id", leadId);
  if (updateError) {
    console.error("[admin] status update failed:", updateError.message);
    return { ok: false, code: "server_error", message: "Could not save the status." };
  }

  const { error: eventError } = await supabase.from("lead_events").insert({
    lead_id: leadId,
    event_type: "status_changed",
    actor_user_id: user.id,
    body: `Status moved from ${currentStatus} to ${nextStatus}.`,
    metadata: { from: currentStatus, to: nextStatus },
  });
  if (eventError) {
    console.error("[admin] event insert failed:", eventError.message);
  }

  return { ok: true, code: "saved", message: `Marked ${nextStatus}.` };
}

/** Append a free text note event to the lead timeline. */
export async function addNote(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const auth = await requireAdmin();
  if (!auth) {
    return { ok: false, code: "not_admin", message: "This account does not have admin access." };
  }

  const leadId = String(formData.get("lead_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!leadId || body.length < 1 || body.length > 2000) {
    return {
      ok: false,
      code: "invalid",
      message: "Write a note between 1 and 2000 characters.",
    };
  }

  const { supabase, user } = auth;
  const { error } = await supabase.from("lead_events").insert({
    lead_id: leadId,
    event_type: "note",
    actor_user_id: user.id,
    body,
  });
  if (error) {
    console.error("[admin] note insert failed:", error.message);
    return { ok: false, code: "server_error", message: "Could not save the note." };
  }
  return { ok: true, code: "saved", message: "Note added." };
}

/**
 * Patch only the keys present in the form (partial). The sidebar
 * emergency toggle sends just emergency_mode and cannot clobber the rest.
 */
export async function updateSettings(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const auth = await requireAdmin();
  if (!auth) {
    return { ok: false, code: "not_admin", message: "This account does not have admin access." };
  }

  const raw: Record<string, unknown> = {};
  if (formData.has("phone")) raw.phone = String(formData.get("phone") ?? "");
  if (formData.has("emergency_mode")) {
    raw.emergency_mode = String(formData.get("emergency_mode") ?? "");
  }
  if (formData.has("emergency_banner")) {
    raw.emergency_banner = String(formData.get("emergency_banner") ?? "");
  }
  if (formData.has("business_hours")) {
    try {
      raw.business_hours = JSON.parse(String(formData.get("business_hours") ?? "{}"));
    } catch {
      return { ok: false, code: "invalid", message: "Business hours were not valid JSON." };
    }
  }

  const parsed = settingsPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid",
      fieldErrors: fieldErrorsFrom(parsed.error),
      message: "Check the highlighted fields.",
    };
  }

  const { supabase } = auth;
  const { error } = await supabase
    .from("site_settings")
    .update(parsed.data)
    .eq("id", true);
  if (error) {
    console.error("[admin] settings update failed:", error.message);
    return { ok: false, code: "server_error", message: "Could not save the settings." };
  }
  return { ok: true, code: "saved", message: "Settings saved." };
}

/** Update the most recent offer, or create the first when none exists. */
export async function updateOffer(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const auth = await requireAdmin();
  if (!auth) {
    return { ok: false, code: "not_admin", message: "This account does not have admin access." };
  }

  const parsed = offerSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    starts_on: String(formData.get("starts_on") ?? ""),
    ends_on: String(formData.get("ends_on") ?? ""),
    is_active: String(formData.get("is_active") ?? "false"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid",
      fieldErrors: fieldErrorsFrom(parsed.error),
      message: "Check the offer fields.",
    };
  }

  const { supabase } = auth;
  const { data: recent } = await supabase
    .from("offers")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent) {
    const { error } = await supabase
      .from("offers")
      .update(parsed.data)
      .eq("id", recent.id);
    if (error) {
      console.error("[admin] offer update failed:", error.message);
      return { ok: false, code: "server_error", message: "Could not save the offer." };
    }
  } else {
    const { error } = await supabase.from("offers").insert(parsed.data);
    if (error) {
      console.error("[admin] offer insert failed:", error.message);
      return { ok: false, code: "server_error", message: "Could not create the offer." };
    }
  }
  return { ok: true, code: "saved", message: "Offer saved." };
}

/** Internal helper: bounce non admins away from admin pages. */
export async function requireAdminRedirect(): Promise<void> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) {
    redirect("/admin/sign-in");
  }
}

