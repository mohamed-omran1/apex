import { randomBytes } from "crypto";

const PHONE_WINDOW_LIMIT = 3;
const IP_WINDOW_LIMIT = 6;
const WINDOW_MS = 10 * 60 * 1000;

const phoneHits = new Map<string, number[]>();
const ipHits = new Map<string, number[]>();

/** Digits only, drops a leading US country code, so formats compare equal. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
}

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

export function checkLeadRateLimit(
  phone: string,
  ip: string,
  now: number = Date.now(),
): { ok: true } | { ok: false; scope: "phone" | "ip" } {
  const phoneKey = normalizePhone(phone) || "unknown";
  const ipKey = ip || "unknown";

  if (!withinLimit(phoneHits, phoneKey, PHONE_WINDOW_LIMIT, now)) {
    return { ok: false, scope: "phone" };
  }
  if (!withinLimit(ipHits, ipKey, IP_WINDOW_LIMIT, now)) {
    return { ok: false, scope: "ip" };
  }
  return { ok: true };
}

/** Test hook: clears both windows. Not called by application code. */
export function resetLeadRateLimits(): void {
  phoneHits.clear();
  ipHits.clear();
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferenceCode(): string {
  const bytes = randomBytes(6);
  let code = "APX-";
  for (let i = 0; i < 6; i += 1) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}
