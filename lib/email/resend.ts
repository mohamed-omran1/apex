import { Resend } from "resend";

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; skipped: true }
  | { ok: false; error: string };

function isConfigured(): { key: string; from: string } | null {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    return null;
  }
  return { key, from };
}

/**
 * Best effort transactional send. Returns skipped when Resend is not
 * configured so the lead action can continue without failing the submit.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  idempotencyKey?: string;
}): Promise<SendResult> {
  const config = isConfigured();
  if (!config) {
    console.warn(
      "[email] RESEND_API_KEY or RESEND_FROM missing; skipping send:",
      input.subject,
    );
    return { ok: false, skipped: true };
  }

  const resend = new Resend(config.key);
  const { data, error } = await resend.emails.send({
    from: config.from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    ...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
  });

  if (error) {
    console.error("[email] send failed:", error.name, error.message);
    return { ok: false, error: `${error.name}: ${error.message}` };
  }

  return { ok: true, id: data?.id ?? "" };
}
