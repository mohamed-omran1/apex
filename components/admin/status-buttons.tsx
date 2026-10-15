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
  spam: "Mark spam",
};

const style: Record<string, string> = {
  contacted: "bg-cedar text-paper hover:bg-deep",
  scheduled: "border border-line bg-paper text-soft hover:bg-sand",
  completed: "border border-line bg-paper text-soft hover:bg-sand",
  lost: "border border-line bg-paper text-mute hover:bg-sand",
  spam: "border border-heat/30 bg-heat/10 text-heat hover:bg-heat/15",
};

const initialState: AdminFormState = { ok: false, code: "invalid" };

export function StatusButtons({
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

  if (allowed.length === 0) {
    return (
      <p className="text-[13px] text-mute">
        No further moves from {status}.
      </p>
    );
  }

  return (
    <div>
      <form action={formAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="lead_id" value={leadId} />
        {allowed.map((next) => (
          <button
            key={next}
            type="submit"
            name="status"
            value={next}
            disabled={pending}
            className={`rounded-full px-4 py-2 text-[13px] font-medium disabled:opacity-50 ${
              style[next] ?? "border border-line bg-paper text-soft"
            }`}
          >
            {label[next] ?? next}
          </button>
        ))}
      </form>
      {state.message ? (
        <p
          className={`mt-2 text-[13px] ${state.ok ? "text-cedar" : "text-heat"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
