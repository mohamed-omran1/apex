"use client";

import { useActionState } from "react";
import { requestOtp, type AuthFormState } from "@/actions/auth";
import { buttonClass } from "@/components/ui/button";

const inputClass =
  "w-full rounded-field border border-line bg-paper p-[14px] text-[16px] leading-6 text-ink placeholder:text-mute aria-invalid:border-heat aria-invalid:border-[1.5px]";
const labelClass = "block text-[13px] font-medium leading-[18px] text-ink";
const errorClass = "mt-1.5 text-[13px] leading-[18px] text-heat";

const initialState: AuthFormState = { ok: false, code: "invalid" };

export function SignInForm({
  email,
  next,
  onSent,
}: {
  email: string;
  next: string;
  onSent: (email: string) => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: AuthFormState, formData: FormData) => {
      const result = await requestOtp(prev, formData);
      if (result.ok) {
        const value = String(formData.get("email") ?? "").trim();
        onSent(value);
      }
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={email}
          placeholder="you@apex.example"
          className={`mt-1.5 ${inputClass}`}
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        {state.fieldErrors?.email ? (
          <p id="email-error" className={errorClass} role="alert">
            {state.fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      {state.message && !state.ok ? (
        <p className={`${errorClass} rounded-field bg-heat/5 p-3`} role="alert">
          {state.message}
        </p>
      ) : null}
      {state.message && state.ok ? (
        <p className="text-[13px] leading-[18px] text-cedar" role="status">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={buttonClass("primary", "w-full disabled:opacity-60")}
      >
        {pending ? "Sending…" : "Email me a code"}
      </button>
    </form>
  );
}
