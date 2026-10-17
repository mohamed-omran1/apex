import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { kindLabels, StatusPill } from "@/components/admin/pills";
import { NoteForm } from "@/components/admin/note-form";
import { StatusButtons } from "@/components/admin/status-buttons";
import { createSessionClient } from "@/lib/supabase/server";

// Admin reads the session from cookies and must never be prerendered.
// Cache Components replaced the old dynamic segment config with this flag.
export const instant = false;

export const metadata: Metadata = { title: "Lead" };

const windowLabels: Record<string, string> = {
  asap: "As soon as possible",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

type Lead = {
  id: string;
  kind: string;
  status: string;
  name: string;
  phone: string;
  email: string | null;
  zip: string;
  address: string | null;
  issue: string | null;
  preferred_day: string | null;
  preferred_window: string | null;
  consent_email: boolean;
  consent_sms: boolean;
  consent_at: string | null;
  consent_version: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  reference_code: string;
  created_at: string;
};

type EventRow = {
  id: string;
  event_type: string;
  body: string | null;
  actor_user_id: string | null;
  created_at: string;
};

function fact(label: string, value: string | null | boolean) {
  if (value === null || value === "" || value === false) return null;
  return { label, value: typeof value === "boolean" ? "Yes" : value };
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const supabase = await createSessionClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!lead) notFound();

  const { data: events } = await supabase
    .from("lead_events")
    .select("id, event_type, body, actor_user_id, created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const typed = lead as Lead;
  const timeline = (events ?? []) as EventRow[];

  const facts = [
    fact("Phone", typed.phone),
    fact("Email", typed.email),
    fact("ZIP", typed.zip),
    fact("Address", typed.address),
    fact("Issue", typed.issue),
    fact(
      "Preferred day",
      typed.preferred_day
        ? new Date(`${typed.preferred_day}T12:00:00`).toLocaleDateString("en-US", {
            dateStyle: "medium",
          })
        : null,
    ),
    fact(
      "Preferred window",
      typed.preferred_window
        ? (windowLabels[typed.preferred_window] ?? typed.preferred_window)
        : null,
    ),
    fact("Email consent", typed.consent_email),
    fact("SMS consent", typed.consent_sms),
    fact("Consent version", typed.consent_version),
    fact("UTM source", typed.utm_source),
    fact("UTM medium", typed.utm_medium),
    fact("UTM campaign", typed.utm_campaign),
    fact("Reference", typed.reference_code),
    fact(
      "Received",
      new Date(typed.created_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    ),
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <main className="mx-auto flex w-full max-w-[860px] flex-col gap-[18px] px-6 py-6 lg:px-7">
      <Link
        href="/admin/inbox"
        className="text-[14px] font-medium text-cedar hover:underline"
      >
        Back to inbox
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[32px] leading-[38px] font-semibold text-ink">
            {typed.name}
          </h1>
          <p className="mt-1 text-[14px] text-soft">
            {kindLabels[typed.kind] ?? typed.kind} · {typed.reference_code}
          </p>
        </div>
        <StatusPill status={typed.status} />
      </div>

      <div className="grid gap-4 min-md:grid-cols-2">
        {/* Facts */}
        <section className="rounded-[16px] border border-line bg-paper p-4">
          <h2 className="text-[13px] font-semibold tracking-[1px] text-copper">
            FACTS
          </h2>
          <dl className="mt-3 flex flex-col gap-2">
            {facts.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-3 border-b border-line/60 pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-[13px] text-mute">{item.label}</dt>
                <dd className="max-w-[60%] break-words text-right text-[13px] text-ink">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Timeline */}
        <section className="rounded-[16px] border border-line bg-paper p-4">
          <h2 className="text-[13px] font-semibold tracking-[1px] text-copper">
            TIMELINE
          </h2>
          {timeline.length === 0 ? (
            <p className="mt-3 text-[13px] text-mute">No events yet.</p>
          ) : (
            <ol className="mt-3 flex flex-col gap-3">
              {timeline.map((event) => (
                <li key={event.id} className="border-b border-line/60 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold text-ink">
                      {event.event_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-mute">
                      {new Date(event.created_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  {event.body ? (
                    <p className="mt-1 text-[13px] leading-[19px] text-soft">
                      {event.body}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-mute">
                    {event.actor_user_id ? "Admin" : "System"}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* Note */}
      <section className="rounded-[16px] border border-line bg-paper p-4">
        <NoteForm leadId={typed.id} />
      </section>

      {/* Actions */}
      <section className="rounded-[16px] border border-line bg-paper p-4">
        <h2 className="text-[13px] font-semibold tracking-[1px] text-copper">
          ACTIONS
        </h2>
        <div className="mt-3">
          <StatusButtons leadId={typed.id} status={typed.status} />
        </div>
      </section>
    </main>
  );
}
