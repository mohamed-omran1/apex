"use client";

import { useActionState } from "react";
import {
  leadTransitions,
  type AdminFormState,
  type LeadStatus,
} from "@/lib/admin/transitions";
import { updateLeadStatus } from "@/actions/admin";

const label: Record<string, string> = {
  contacted: "Mark contacted",
  scheduled: "Mark scheduled",
  completed: "Mark completed",
  lost: "Mark lost",
  spam: "Spam",
};

const style: Record<string, string> = {
  contacted: "bg-cedar text-paper hover:bg-deep",
  scheduled: "border border-line bg-paper text-soft hover:bg-sand",
  completed: "border border-line bg-paper text-soft hover:bg-sand",
  lost: "border border-line bg-paper text-mute hover:bg-sand",
  spam: "border border-heat/30 bg-heat/10 text-heat hover:bg-heat/15",
};

const initialState: AdminFormState = { ok: false, code: "invalid" };

export function LeadRowActions({
  leadId,
  status,
}: {
  leadId: string;
  status: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateLeadStatus,
    initialState,
  );
  const allowed = leadTransitions[status as LeadStatus] ?? [];

  return (
    <div className="flex flex-col items-end gap-1.5">
      <form action={formAction} className="flex flex-wrap justify-end gap-1.5">
        <input type="hidden" name="lead_id" value={leadId} />
        {allowed.map((next) => (
          <button
            key={next}
            type="submit"
            name="status"
            value={next}
            disabled={pending}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium disabled:opacity-50 ${style[next] ?? "border border-line bg-paper text-soft"}`}
          >
            {label[next] ?? next}
          </button>
        ))}
        {allowed.length === 0 ? (
          <span className="rounded-full border border-line bg-sand px-3 py-1.5 text-[12px] text-mute">
            No moves
          </span>
        ) : null}
      </form>
      {state.message ? (
        <p
          className={`max-w-[160px] text-right text-[11px] leading-[15px] ${
            state.ok ? "text-cedar" : "text-heat"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
