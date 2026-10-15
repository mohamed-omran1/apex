import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient, isAdminUser } from "@/lib/supabase/server";
import type { LeadKind, LeadStatus } from "@/lib/admin/transitions";

// Phase 2 migration column order. The header row and every data row use
// this list, so the CSV matches the schema.
const COLUMNS = [
  "id",
  "kind",
  "status",
  "name",
  "phone",
  "email",
  "zip",
  "address",
  "issue",
  "preferred_day",
  "preferred_window",
  "consent_email",
  "consent_sms",
  "consent_at",
  "consent_version",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "reference_code",
  "created_at",
] as const;

type LeadRow = Record<string, unknown>;

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  // Formula injection guard: prefix = + @ (and tab/CR variants) with a quote.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function toCsv(rows: LeadRow[]): string {
  const header = COLUMNS.join(",");
  const lines = rows.map((row) =>
    COLUMNS.map((column) => csvCell(row[column])).join(","),
  );
  return [header, ...lines].join("\r\n");
}

export async function GET(request: NextRequest) {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.redirect(new URL("/admin/sign-in", request.url));
  }

  const sp = request.nextUrl.searchParams;
  const status = sp.get("status") ?? "";
  const kind = sp.get("kind") ?? "";
  const q = (sp.get("q") ?? "").trim();
  // page is intentionally ignored: the export is every matching row.

  let query = supabase.from("leads").select(COLUMNS.join(", "));
  if (status) query = query.eq("status", status as LeadStatus);
  if (kind) query = query.eq("kind", kind as LeadKind);
  if (q) {
    const safe = q.replace(/[%_]/g, "\\$&");
    query = query.or(
      `name.ilike.%${safe}%,reference_code.ilike.%${safe}%,phone.like.%${safe}%`,
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("[export] query failed:", error.message);
    return new NextResponse("Export failed", { status: 500 });
  }

  const csv = toCsv((data ?? []) as unknown as LeadRow[]);
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}


