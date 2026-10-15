const EMAIL_WINDOW_LIMIT = 3;
const IP_WINDOW_LIMIT = 6;
const WINDOW_MS = 10 * 60 * 1000;

const emailHits = new Map<string, number[]>();
const ipHits = new Map<string, number[]>();

function withinLimit(
  hits: Map<string, number[]>,
  key: string,
  max: number,
  now: number,
): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

/**
 * OTP request limiter. Keys on the lowercased trimmed email and the first
 * x-forwarded-for hop, matching phase-4 AC-1. In memory per instance: the
 * same honest demo stance as the Phase 3 lead limiter.
 */
export function checkOtpRateLimit(
  email: string,
  ip: string,
  now: number = Date.now(),
): { ok: true } | { ok: false; scope: "email" | "ip" } {
  const emailKey = email.trim().toLowerCase() || "unknown";
  const ipKey = ip || "unknown";

  if (!withinLimit(emailHits, emailKey, EMAIL_WINDOW_LIMIT, now)) {
    return { ok: false, scope: "email" };
  }
  if (!withinLimit(ipHits, ipKey, IP_WINDOW_LIMIT, now)) {
    return { ok: false, scope: "ip" };
  }
  return { ok: true };
}

/** Test hook: clears both windows. Not called by application code. */
export function resetOtpRateLimits(): void {
  emailHits.clear();
  ipHits.clear();
}
