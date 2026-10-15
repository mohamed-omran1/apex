import type { Metadata } from "next";
import { SettingsForms } from "@/components/admin/settings-forms";
import { createSessionClient } from "@/lib/supabase/server";

// Admin reads the session from cookies and must never be prerendered.
// Cache Components replaced the old dynamic segment config with this flag.
export const instant = false;

export const metadata: Metadata = { title: "Settings" };

const defaultHours = { mon_sat: "7a-7p", emergency: "24/7", online: "anytime" };

type HoursShape = { mon_sat?: string; emergency?: string; online?: string };

export default async function SettingsPage() {
  const supabase = await createSessionClient();

  const { data: settingsRow } = await supabase
    .from("site_settings")
    .select("phone, business_hours, emergency_mode, emergency_banner")
    .eq("id", true)
    .maybeSingle();

  const { data: offerRow } = await supabase
    .from("offers")
    .select("id, title, body, starts_on, ends_on, is_active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const rawHours = (settingsRow?.business_hours ?? {}) as HoursShape;
  // Normalize missing keys with defaults before render (phase-4 AC-7).
  const hours = {
    mon_sat: rawHours.mon_sat ?? defaultHours.mon_sat,
    emergency: rawHours.emergency ?? defaultHours.emergency,
    online: rawHours.online ?? defaultHours.online,
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="flex flex-col gap-4 px-6 py-6 lg:px-7">
      <div>
        <h1 className="font-display text-[32px] leading-[38px] font-semibold text-ink">
          Settings
        </h1>
        <p className="mt-1 max-w-[860px] text-[15px] leading-[22px] text-soft">
          The owner edits the offer, the hours, and whether the site says the
          emergency line is open. Nothing here bills a customer.
        </p>
      </div>

      <SettingsForms
        settings={{
          phone: settingsRow?.phone ?? "(214) 555-0148",
          emergencyMode: settingsRow?.emergency_mode ?? false,
          emergencyBanner: settingsRow?.emergency_banner ?? "",
          hours,
        }}
        offer={{
          id: offerRow?.id ?? null,
          title: offerRow?.title ?? "",
          body: offerRow?.body ?? "",
          startsOn: offerRow?.starts_on ?? today,
          endsOn: offerRow?.ends_on ?? today,
          isActive: offerRow?.is_active ?? false,
        }}
      />
    </main>
  );
}
