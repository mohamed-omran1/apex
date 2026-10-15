"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/lib/admin/transitions";
import { addNote } from "@/actions/admin";
import { buttonClass } from "@/components/ui/button";

const initialState: AdminFormState = { ok: false, code: "invalid" };

export function NoteForm({ leadId }: { leadId: string }) {
  const [state, formAction, pending] = useActionState(
    addNote,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="lead_id" value={leadId} />
      <label htmlFor="body" className="text-[13px] font-medium text-ink">
        Note
      </label>
      <textarea
        id="body"
        name="body"
        rows={3}
        maxLength={2000}
        placeholder="What happened on the call, what you promised, anything the next person needs."
        className="rounded-field border border-line bg-paper px-3 py-2.5 text-[14px] leading-[21px] text-ink placeholder:text-mute"
      />
      {state.message ? (
        <p
          className={`text-[13px] ${state.ok ? "text-cedar" : "text-heat"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <div>
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("ghost", "text-[13px] disabled:opacity-60")}
        >
          {pending ? "Adding…" : "Add note"}
        </button>
      </div>
    </form>
  );
}
