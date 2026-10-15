"use client";

import { useActionState } from "react";
import { verifyOtp, type AuthFormState } from "@/actions/auth";
import { buttonClass } from "@/components/ui/button";

const inputClass =
  "w-full rounded-field border border-line bg-paper p-[14px] text-center font-mono text-[28px] tracking-[0.35em] text-ink placeholder:tracking-normal placeholder:text-[16px] placeholder:text-mute aria-invalid:border-heat aria-invalid:border-[1.5px]";
const labelClass = "block text-[13px] font-medium leading-[18px] text-ink";
const errorClass = "mt-1.5 text-[13px] leading-[18px] text-heat";

const initialState: AuthFormState = { ok: false, code: "invalid" };

export function CodeForm({
  email,
  next,
}: {
  email: string;
  next: string;
}) {
  const [state, formAction, pending] = useActionState(verifyOtp, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="token" className={labelClass}>
          Six digit code
        </label>
        <input
          id="token"
          name="token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          placeholder="000000"
          className={`mt-1.5 ${inputClass}`}
          aria-invalid={state.fieldErrors?.token ? true : undefined}
          aria-describedby={state.fieldErrors?.token ? "token-error" : undefined}
        />
        {state.fieldErrors?.token ? (
          <p id="token-error" className={errorClass} role="alert">
            {state.fieldErrors.token[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          className={`${errorClass} rounded-field bg-heat/5 p-3`}
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={buttonClass("primary", "w-full disabled:opacity-60")}
      >
        {pending ? "Checking…" : "Open the desk"}
      </button>
    </form>
  );
}
