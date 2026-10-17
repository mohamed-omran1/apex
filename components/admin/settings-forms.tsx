"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminFormState } from "@/lib/admin/transitions";
import { updateOffer, updateSettings } from "@/actions/admin";
import { buttonClass } from "@/components/ui/button";

const inputClass =
  "w-full rounded-field border border-line bg-paper px-3 py-2.5 text-[14px] leading-5 text-ink placeholder:text-mute";
const labelClass = "block text-[13px] font-medium text-ink";

type SettingsValues = {
  phone: string;
  emergencyMode: boolean;
  emergencyBanner: string;
  hours: { mon_sat: string; emergency: string; online: string };
};

type OfferValues = {
  id: string | null;
  title: string;
  body: string;
  startsOn: string;
  endsOn: string;
  isActive: boolean;
};

export function SettingsForms({
  settings,
  offer,
}: {
  settings: SettingsValues;
  offer: OfferValues;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [settingsState, setSettingsState] = useState<AdminFormState | null>(null);
  const [offerState, setOfferState] = useState<AdminFormState | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setSettingsState(null);
    setOfferState(null);

    const form = event.currentTarget;
    const fd = new FormData(form);

    // An unchecked checkbox is omitted from FormData entirely. Make the
    // key explicit so the partial patch can write false, not skip it.
    if (!fd.has("emergency_mode")) {
      fd.set("emergency_mode", "false");
    }

    // The action patches business_hours as one JSON object; assemble it
    // from the three per line inputs before handing the FormData over.
    fd.set(
      "business_hours",
      JSON.stringify({
        mon_sat: String(fd.get("hours_mon_sat") ?? ""),
        emergency: String(fd.get("hours_emergency") ?? ""),
        online: String(fd.get("hours_online") ?? ""),
      }),
    );

    // One FormData, two actions. updateSettings only reads the keys it
    // knows; updateOffer only reads its own. Sequential so a slow offer
    // save never races the settings write.
    const settingsResult = await updateSettings(
      { ok: false, code: "invalid" },
      fd,
    );
    setSettingsState(settingsResult);

    const offerResult = await updateOffer({ ok: false, code: "invalid" }, fd);
    setOfferState(offerResult);

    // Re-render the admin tree so the sidebar emergency indicator picks
    // up the row the action just wrote (and revalidated).
    if (settingsResult.ok || offerResult.ok) {
      router.refresh();
    }

    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 min-md:grid-cols-3">
        {/* Emergency mode */}
        <section className="rounded-[16px] border border-line bg-paper p-4">
          <h2 className="text-[15px] font-semibold text-ink">Emergency mode</h2>
          <p className="mt-1 text-[13px] leading-[19px] text-soft">
            Flip this and the site banner tells visitors the emergency line is
            open.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                name="emergency_mode"
                value="true"
                defaultChecked={settings.emergencyMode}
                className="size-4 accent-cedar"
              />
              <span className="text-[14px] font-medium text-ink">
                Emergency line open
              </span>
            </label>
            <div>
              <label htmlFor="emergency_banner" className={labelClass}>
                Banner text
              </label>
              <input
                id="emergency_banner"
                name="emergency_banner"
                defaultValue={settings.emergencyBanner}
                maxLength={300}
                placeholder="Shown on the public site while mode is on"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
          </div>
        </section>

        {/* Seasonal offer */}
        <section className="rounded-[16px] border border-line bg-paper p-4">
          <h2 className="text-[15px] font-semibold text-ink">Seasonal offer</h2>
          <p className="mt-1 text-[13px] leading-[19px] text-soft">
            The bar at the top of the public site reads from here.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label htmlFor="title" className={labelClass}>
                Title
              </label>
              <input
                id="title"
                name="title"
                defaultValue={offer.title}
                maxLength={120}
                required
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="body" className={labelClass}>
                Line of copy
              </label>
              <input
                id="body"
                name="body"
                defaultValue={offer.body}
                maxLength={300}
                required
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="starts_on" className={labelClass}>
                  Starts
                </label>
                <input
                  id="starts_on"
                  name="starts_on"
                  type="date"
                  defaultValue={offer.startsOn}
                  required
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
              <div>
                <label htmlFor="ends_on" className={labelClass}>
                  Ends
                </label>
                <input
                  id="ends_on"
                  name="ends_on"
                  type="date"
                  defaultValue={offer.endsOn}
                  required
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
            </div>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                name="is_active"
                value="true"
                defaultChecked={offer.isActive}
                className="size-4 accent-cedar"
              />
              <span className="text-[14px] font-medium text-ink">Active</span>
            </label>
          </div>
        </section>

        {/* The business */}
        <section className="rounded-[16px] border border-line bg-paper p-4">
          <h2 className="text-[15px] font-semibold text-ink">The business</h2>
          <p className="mt-1 text-[13px] leading-[19px] text-soft">
            Phone and hours feed the public site. The license number is a
            fixed placeholder.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                defaultValue={settings.phone}
                inputMode="tel"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="hours_mon_sat" className={labelClass}>
                Monday to Saturday hours
              </label>
              <input
                id="hours_mon_sat"
                name="hours_mon_sat"
                defaultValue={settings.hours.mon_sat}
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="hours_emergency" className={labelClass}>
                Emergency line
              </label>
              <input
                id="hours_emergency"
                name="hours_emergency"
                defaultValue={settings.hours.emergency}
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="hours_online" className={labelClass}>
                Online booking
              </label>
              <input
                id="hours_online"
                name="hours_online"
                defaultValue={settings.hours.online}
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <p className="text-[12px] text-mute">TDLR license: TACLB000000C</p>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary", "text-[13px] disabled:opacity-60")}
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        {settingsState?.message ? (
          <p
            className={`text-[13px] ${settingsState.ok ? "text-cedar" : "text-heat"}`}
            role="status"
          >
            {settingsState.message}
          </p>
        ) : null}
        {offerState?.message ? (
          <p
            className={`text-[13px] ${offerState.ok ? "text-cedar" : "text-heat"}`}
            role="status"
          >
            {offerState.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
