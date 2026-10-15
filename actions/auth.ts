"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkOtpRateLimit } from "@/lib/auth/rate-limit";
import { createSessionClient, isAdminUser } from "@/lib/supabase/server";
import {
  requestOtpSchema,
  verifyOtpSchema,
} from "@/lib/validation/auth";

export type AuthFormState = {
  ok: boolean;
  code:
    | "otp_sent"
    | "signed_in"
    | "not_admin"
    | "invalid"
    | "rate_limited"
    | "server_error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const notAdminMessage = "This account does not have admin access.";
const sentMessage =
  "Check your inbox for a six digit code. It expires in a few minutes.";

function fieldErrorsFrom(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}

/**
 * Step 1 of sign in: request an OTP for the email. Never reveals whether
 * the email has an account: unknown addresses get the same generic
 * response and create no user (shouldCreateUser: false).
 */
export async function requestOtp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";

  const emailRaw = String(formData.get("email") ?? "");
  const parsed = requestOtpSchema.safeParse({ email: emailRaw });
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid",
      fieldErrors: fieldErrorsFrom(parsed.error),
      message: "Check the email address.",
    };
  }

  const rate = checkOtpRateLimit(parsed.data.email, ip);
  if (!rate.ok) {
    return {
      ok: false,
      code: "rate_limited",
      message: "Too many codes requested. Wait a few minutes and try again.",
    };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: false },
  });

  // Map user not found / identity errors to the same generic success so
  // the endpoint never reveals whether an account exists.
  if (error) {
    const benign =
      error.status === 422 ||
      /not found|no user|identity/i.test(error.message);
    if (benign) {
      return { ok: true, code: "otp_sent", message: sentMessage };
    }
    console.error("[auth] signInWithOtp failed:", error.message);
    return {
      ok: false,
      code: "server_error",
      message: "Could not send the code right now. Try again shortly.",
    };
  }

  return { ok: true, code: "otp_sent", message: sentMessage };
}

/**
 * Step 2 of sign in: verify the code, check the role claim, keep the
 * session only for admins. Non admins are signed out immediately.
 */
export async function verifyOtp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = verifyOtpSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    token: String(formData.get("token") ?? ""),
    next: String(formData.get("next") ?? "") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid",
      fieldErrors: fieldErrorsFrom(parsed.error),
      message: "Check the code and try again.",
    };
  }

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "email",
  });

  if (error || !data.user) {
    return {
      ok: false,
      code: "invalid",
      message: "That code is wrong or expired. Request a new one.",
    };
  }

  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    return { ok: false, code: "not_admin", message: notAdminMessage };
  }

  redirect(parsed.data.next ?? "/admin/inbox");
}

/** Sign out and land back on the sign-in screen. */
export async function signOut(): Promise<void> {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/sign-in");
}
