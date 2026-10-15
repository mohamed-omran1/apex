"use client";

import { useState } from "react";
import { CodeForm } from "@/components/admin/code-form";
import { SignInForm } from "@/components/admin/sign-in-form";
import { Eyebrow } from "@/components/ui/eyebrow";

export function SignInFlow({
  email: initialEmail,
  next,
}: {
  email: string;
  next: string;
}) {
  const [stage, setStage] = useState<"email" | "code">(
    initialEmail ? "code" : "email",
  );
  const [email, setEmail] = useState(initialEmail);

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6">
      {stage === "email" ? (
        <>
          <div>
            <Eyebrow>OWNER DESK</Eyebrow>
            <h1 className="mt-2 font-display text-[34px] leading-[40px] font-semibold text-ink">
              Sign in with a code
            </h1>
            <p className="mt-3 text-[15px] leading-[22px] text-soft">
              Enter the email for the desk. Apex sends a six digit code; there
              is no password to remember.
            </p>
          </div>
          <SignInForm
            email={email}
            next={next}
            onSent={(value) => {
              setEmail(value);
              setStage("code");
            }}
          />
        </>
      ) : (
        <>
          <div>
            <Eyebrow>CODE SENT</Eyebrow>
            <h1 className="mt-2 font-display text-[34px] leading-[40px] font-semibold text-ink">
              Check your inbox
            </h1>
            <p className="mt-3 text-[15px] leading-[22px] text-soft">
              We sent a six digit code to{" "}
              <span className="font-medium text-ink">{email}</span>. It expires
              in a few minutes.
            </p>
          </div>
          <CodeForm email={email} next={next} />
          <button
            type="button"
            onClick={() => setStage("email")}
            className="self-start text-[14px] font-medium text-cedar hover:underline"
          >
            Use a different email
          </button>
        </>
      )}
    </div>
  );
}
