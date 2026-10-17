"use client";

import { useEffect, useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // The action revalidates /admin/inbox and /admin/leads/[id] and calls
  // refresh() so the RSC payload carries the new status. This extra
  // router.refresh() covers the case where that payload is dropped.
  useEffect(() => {
    if (state.ok) {
      startTransition(() => {
        router.refresh();
      });
    }
  }, [state, router]);

  // Always derive buttons from the server status prop. Optimistically
  // swapping the button set removes the submit button before the form
  // action fires, so the POST never goes out.
  const allowed = leadTransitions[status as LeadStatus] ?? [];

  return (
    <div className="flex flex-col items-end gap-1.5">
      <form
        action={formAction}
        className="grid w-full grid-cols-2 gap-1.5 max-[359px]:grid-cols-1 min-lg:flex min-lg:flex-wrap min-lg:justify-end"
      >
        <input type="hidden" name="lead_id" value={leadId} />
        {allowed.map((next, i) => (
          <button
            key={next}
            type="submit"
            name="status"
            value={next}
            disabled={pending || isPending}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium disabled:opacity-50 ${
              i === allowed.length - 1 && allowed.length % 2 === 1
                ? "col-span-full"
                : ""
            } ${style[next] ?? "border border-line bg-paper text-soft"}`}
          >
            {label[next] ?? next}
          </button>
        ))}
        {allowed.length === 0 ? (
          <span className="col-span-full justify-self-end rounded-full border border-line bg-sand px-3 py-1.5 text-[12px] text-mute">
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
