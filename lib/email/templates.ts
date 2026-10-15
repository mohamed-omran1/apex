import type { LeadKind, PreferredWindow } from "@/lib/validation/lead";

export interface LeadEmailData {
  id: string;
  referenceCode: string;
  kind: LeadKind;
  name: string;
  phone: string;
  zip: string;
  email: string | null;
  address: string | null;
  issue: string | null;
  preferredDay: string | null;
  preferredWindow: string | null;
  consentEmail: boolean;
  createdAt: string;
  outsideArea?: boolean;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const kindLabels: Record<LeadKind, string> = {
  emergency: "Emergency",
  repair: "Repair",
  estimate: "In-home estimate",
  tune_up: "Tune-up",
  membership_enquiry: "Membership question",
};

const windowLabels: Record<PreferredWindow, string> = {
  asap: "As soon as possible",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function row(label: string, value: string): { html: string; text: string } {
  return {
    html: `<tr><td style="padding:6px 12px 6px 0;color:#555;vertical-align:top;font-size:14px;">${escapeHtml(label)}</td><td style="padding:6px 0;font-size:14px;">${value}</td></tr>`,
    text: `${label}: ${value.replaceAll(/<[^>]+>/g, "")}`,
  };
}

function shell(title: string, bodyHtml: string, bodyText: string): {
  html: string;
  text: string;
} {
  return {
    html: `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#111;"><div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e3e5e8;border-radius:8px;padding:24px;"><h1 style="margin:0 0 16px;font-size:18px;">${escapeHtml(title)}</h1>${bodyHtml}<p style="margin:20px 0 0;font-size:12px;color:#777;">Apex Climate Solutions · fictional demo company · TACLB000000C</p></div></body></html>`,
    text: `${title}\n\n${bodyText}\n\nApex Climate Solutions - fictional demo company - TACLB000000C`,
  };
}

function detailRows(lead: LeadEmailData): { html: string; text: string[] } {
  const rows = [
    row("Reference", escapeHtml(lead.referenceCode)),
    row("Kind", escapeHtml(kindLabels[lead.kind])),
    row("Name", escapeHtml(lead.name)),
    row("Phone", `<a href="${escapeHtml(telHref(lead.phone))}">${escapeHtml(lead.phone)}</a>`),
    row("ZIP", escapeHtml(lead.zip)),
    ...(lead.address ? [row("Address", escapeHtml(lead.address))] : []),
    ...(lead.email ? [row("Email", escapeHtml(lead.email))] : []),
    ...(lead.issue ? [row("Issue", escapeHtml(lead.issue))] : []),
    ...(lead.preferredDay
      ? [row("Preferred day", escapeHtml(lead.preferredDay))]
      : []),
    ...(lead.preferredWindow
      ? [
          row(
            "Preferred window",
            escapeHtml(
              windowLabels[lead.preferredWindow as PreferredWindow] ??
                lead.preferredWindow,
            ),
          ),
        ]
      : []),
    row("Received", escapeHtml(new Date(lead.createdAt).toLocaleString("en-US"))),
  ];

  return {
    html: `<table style="border-collapse:collapse;">${rows.map((r) => r.html).join("")}</table>`,
    text: rows.map((r) => r.text),
  };
}

export function ownerAlert(lead: LeadEmailData, siteUrl: string): RenderedEmail {
  const urgent = lead.kind === "emergency";
  const subject = `${urgent ? "URGENT: " : ""}New lead ${lead.referenceCode} (${lead.kind}, ${lead.zip})`;
  const details = detailRows(lead);
  const adminUrl = `${siteUrl.replace(/\/$/, "")}/admin/leads/${lead.id}`;
  const actionLine = `<p style="font-size:14px;margin:16px 0;"><a href="${escapeHtml(telHref(lead.phone))}" style="display:inline-block;background:#14532d;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:bold;">Call ${escapeHtml(lead.name)}</a></p>`;
  const outsideLine = lead.outsideArea
    ? `<p style="font-size:14px;margin:12px 0;padding:10px 12px;background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;">ZIP ${escapeHtml(lead.zip)} is outside the active service areas. The visitor was warned and asked to call, but left the request anyway. Decide to accept or decline.</p>`
    : "";
  const adminLine = `<p style="font-size:14px;margin:8px 0;"><a href="${escapeHtml(adminUrl)}">Open in the admin inbox</a></p>`;

  const { html: bodyHtml, text: bodyText } = shell(
    urgent ? "New emergency lead" : "New lead",
    `${actionLine}<table style="border-collapse:collapse;">${details.html}</table>${outsideLine}${adminLine}`,
    [
      urgent ? "New emergency lead." : "New lead.",
      ...details.text,
      ...(lead.outsideArea
        ? [`Service area: ZIP ${lead.zip} is outside the active areas.`]
        : []),
      `Admin: ${adminUrl}`,
      `Call link: ${telHref(lead.phone)}`,
    ].join("\n"),
  );

  return { subject, html: bodyHtml, text: bodyText };
}

export function visitorReceipt(
  lead: LeadEmailData,
  siteUrl: string,
): RenderedEmail {
  const subject = `We got your request ${lead.referenceCode} - Apex Climate Solutions`;
  const details = detailRows(lead);
  const phone = `<p style="font-size:14px;margin:16px 0;">Need us sooner? Call <a href="${escapeHtml(telHref(lead.phone))}">${escapeHtml(lead.phone)}</a> any time, day or night.</p>`;

  const { html: bodyHtml, text: bodyText } = shell(
    `Thanks, ${lead.name.split(" ")[0]}.`,
    `<p style="font-size:14px;margin:0 0 12px;">Your request is in. The owner reviews it personally and confirms by phone, usually the same day. Your reference code is <strong>${escapeHtml(lead.referenceCode)}</strong>.</p><table style="border-collapse:collapse;">${details.html}</table>${phone}<p style="font-size:13px;color:#555;">Apex Climate Solutions is a fictional demo company. This message was generated by a demo site, no real service was scheduled.</p>`,
    [
      `Thanks, ${lead.name.split(" ")[0]}.`,
      "",
      "Your request is in. The owner reviews it personally and confirms by phone, usually the same day.",
      `Your reference code: ${lead.referenceCode}`,
      ...details.text,
      "",
      `Need us sooner? Call ${lead.phone} any time, day or night.`,
      "",
      "Apex Climate Solutions is a fictional demo company. This message was generated by a demo site, no real service was scheduled.",
      `Home: ${siteUrl}`,
    ].join("\n"),
  );

  return { subject, html: bodyHtml, text: bodyText };
}
