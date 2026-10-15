import type { Metadata } from "next";
import Link from "next/link";
import { KindPill, StatusPill, statusLabels } from "@/components/admin/pills";
import { buttonClass } from "@/components/ui/button";
import { createSessionClient } from "@/lib/supabase/server";
import {
  leadTransitions,
  type LeadKind,
  type LeadStatus,
} from "@/lib/admin/transitions";
import { LeadRowActions } from "@/components/admin/lead-row-actions";

// Admin reads the session from cookies and must never be prerendered.
// Cache Components replaced the old dynamic segment config with this flag.
export const instant = false;

export const metadata: Metadata = { title: "Inbox" };

const PAGE_SIZE = 25;

type LeadRow = {
  id: string;
  name: string;
  phone: string;
  zip: string;
  kind: string;
  status: string;
  issue: string | null;
  reference_code: string;
  created_at: string;
};

const STATUSES = Object.keys(leadTransitions) as LeadStatus[];
const KINDS: LeadKind[] = [
  "emergency",
  "repair",
  "estimate",
  "tune_up",
  "membership_enquiry",
];

function buildQuery(
  supabase: Awaited<ReturnType<typeof createSessionClient>>,
  filters: { status?: string; kind?: string; q?: string },
) {
  let query = supabase.from("leads").select(
    "id, name, phone, zip, kind, status, issue, reference_code, created_at",
  );
  if (filters.status && (STATUSES as string[]).includes(filters.status)) {
    query = query.eq("status", filters.status as LeadStatus);
  }
  if (filters.kind && (KINDS as string[]).includes(filters.kind)) {
    query = query.eq("kind", filters.kind as LeadKind);
  }
  if (filters.q) {
    const q = filters.q.replace(/[%_]/g, "\\$&");
    query = query.or(
      `name.ilike.%${q}%,reference_code.ilike.%${q}%,phone.like.%${q}%`,
    );
  }
  return query;
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    kind?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const kind = params.kind ?? "";
  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number(params.page) || 1);

  const supabase = await createSessionClient();

  // Demo scale: fetch the filtered set once, pin emergencies, page in JS.
  // Keeps the count and the rows in the same order without a second query.
  const { data: allRows } = await buildQuery(supabase, { status, kind, q })
    .order("created_at", { ascending: false });

  const leads = ((allRows ?? []) as unknown as LeadRow[]).slice().sort((a, b) => {
    const pin = (row: LeadRow) =>
      row.status === "new" && row.kind === "emergency" ? 0 : 1;
    const pinDiff = pin(a) - pin(b);
    if (pinDiff !== 0) return pinDiff;
    return b.created_at.localeCompare(a.created_at);
  });
  const total = leads.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageLeads = leads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statuses = STATUSES;
  const kinds = KINDS;

  function chipHref(next: { status?: string; kind?: string; q?: string }) {
    const sp = new URLSearchParams();
    const s = next.status !== undefined ? next.status : status;
    const k = next.kind !== undefined ? next.kind : kind;
    if (s) sp.set("status", s);
    if (k) sp.set("kind", k);
    if (q) sp.set("q", q);
    const path = `/admin/inbox${sp.size ? `?${sp}` : ""}`;
    return path;
  }

  const exportSp = new URLSearchParams();
  if (status) exportSp.set("status", status);
  if (kind) exportSp.set("kind", kind);
  if (q) exportSp.set("q", q);
  const exportHref = `/admin/export${exportSp.size ? `?${exportSp}` : ""}`;

  return (
    <main className="flex flex-col gap-4 px-6 py-6 lg:px-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[32px] leading-[38px] font-semibold text-ink">
            Inbox
          </h1>
          <p className="mt-1 text-[14px] text-soft">
            {total} lead{total === 1 ? "" : "s"}
            {status ? ` · ${statusLabels[status] ?? status}` : ""}
          </p>
        </div>
        <a href={exportHref} className={buttonClass("ghost", "text-[13px]")}>
          Export CSV
        </a>
      </div>

      {/* Filters */}
      <form method="get" action="/admin/inbox" className="flex flex-wrap items-center gap-2">
        <label htmlFor="q" className="sr-only">
          Search leads
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Name, phone, or reference"
          className="h-10 w-[220px] rounded-full border border-line bg-paper px-4 text-[13px] text-ink placeholder:text-mute"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Status filter">
          <Link
            href={chipHref({ status: "" })}
            className={`rounded-full border px-3.5 py-2 text-[13px] font-medium ${
              !status
                ? "border-transparent bg-cedar text-paper"
                : "border-line bg-paper text-soft"
            }`}
          >
            All
          </Link>
          {statuses.map((s) => (
            <Link
              key={s}
              href={chipHref({ status: s })}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-medium ${
                status === s
                  ? "border-transparent bg-cedar text-paper"
                  : "border-line bg-paper text-soft"
              }`}
            >
              {statusLabels[s]}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Kind filter">
          {kinds.map((k) => (
            <Link
              key={k}
              href={chipHref({ kind: kind === k ? "" : k })}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-medium ${
                kind === k
                  ? "border-transparent bg-cedar text-paper"
                  : "border-line bg-paper text-soft"
              }`}
            >
              {k === "membership_enquiry"
                ? "Membership"
                : k === "estimate"
                  ? "Estimate"
                  : k === "tune_up"
                    ? "Tune-up"
                    : k.charAt(0).toUpperCase() + k.slice(1)}
            </Link>
          ))}
        </div>
        <button
          type="submit"
          className="rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] font-medium text-soft"
        >
          Apply
        </button>
      </form>

      {/* Lead cards */}
      {pageLeads.length === 0 ? (
        <div className="rounded-[16px] border border-line bg-paper px-6 py-14 text-center">
          <p className="font-display text-[22px] text-ink">Nothing here yet.</p>
          <p className="mt-2 text-[14px] text-soft">
            {q || status || kind
              ? "No leads match these filters. Clear a filter and try again."
              : "New requests land here the moment somebody books."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {pageLeads.map((lead) => (
            <li
              key={lead.id}
              className="rounded-[16px] border border-line bg-paper px-4 py-3.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="text-[16px] font-semibold text-ink hover:text-cedar"
                    >
                      {lead.name}
                    </Link>
                    <KindPill kind={lead.kind} />
                    <StatusPill status={lead.status} />
                  </div>
                  <p className="mt-1.5 text-[13px] text-soft">
                    {lead.phone} · ZIP {lead.zip} ·{" "}
                    <span className="font-medium text-mute">
                      {lead.reference_code}
                    </span>
                  </p>
                  {lead.issue ? (
                    <p className="mt-1 line-clamp-2 max-w-[640px] text-[13px] leading-[19px] text-mute">
                      {lead.issue}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[12px] text-mute">
                    {new Date(lead.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <LeadRowActions leadId={lead.id} status={lead.status} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 ? (
        <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Pagination">
          {page > 1 ? (
            <Link
              href={pageLink({ ...params, page: String(page - 1) })}
              className="rounded-full border border-line bg-paper px-4 py-2 text-[13px] font-medium text-soft"
            >
              Previous
            </Link>
          ) : null}
          <span className="text-[13px] text-mute">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link
              href={pageLink({ ...params, page: String(page + 1) })}
              className="rounded-full border border-line bg-paper px-4 py-2 text-[13px] font-medium text-soft"
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}

function pageLink(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  return `/admin/inbox${sp.size ? `?${sp}` : ""}`;
}
