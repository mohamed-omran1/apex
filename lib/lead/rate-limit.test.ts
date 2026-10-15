import { beforeEach, describe, expect, it } from "vitest";
import {
  checkLeadRateLimit,
  generateReferenceCode,
  normalizePhone,
  resetLeadRateLimits,
} from "@/lib/lead/rate-limit";

describe("normalizePhone", () => {
  it("strips formatting", () => {
    expect(normalizePhone("(214) 555-0100")).toBe("2145550100");
    expect(normalizePhone("214.555.0100")).toBe("2145550100");
    expect(normalizePhone("2145550100")).toBe("2145550100");
  });

  it("drops a leading US country code", () => {
    expect(normalizePhone("+1 214 555 0100")).toBe("2145550100");
    expect(normalizePhone("1-214-555-0100")).toBe("2145550100");
  });

  it("leaves other lengths alone", () => {
    expect(normalizePhone("121455501000")).toBe("121455501000");
  });
});

describe("checkLeadRateLimit", () => {
  beforeEach(() => {
    resetLeadRateLimits();
  });

  it("allows three attempts per phone in the window and blocks the fourth", () => {
    const now = 1_000_000;
    expect(checkLeadRateLimit("2145550100", "1.1.1.1", now).ok).toBe(true);
    expect(checkLeadRateLimit("2145550100", "1.1.1.1", now).ok).toBe(true);
    expect(checkLeadRateLimit("2145550100", "1.1.1.1", now).ok).toBe(true);

    const fourth = checkLeadRateLimit("2145550100", "1.1.1.1", now);
    expect(fourth.ok).toBe(false);
    if (!fourth.ok) {
      expect(fourth.scope).toBe("phone");
    }
  });

  it("treats differently formatted versions of the same number as one phone", () => {
    const now = 2_000_000;
    expect(checkLeadRateLimit("(214) 555-0100", "2.2.2.2", now).ok).toBe(true);
    expect(checkLeadRateLimit("214-555-0100", "3.3.3.3", now).ok).toBe(true);
    expect(checkLeadRateLimit("+1 214 555 0100", "4.4.4.4", now).ok).toBe(true);
    const fourth = checkLeadRateLimit("2145550100", "5.5.5.5", now);
    expect(fourth.ok).toBe(false);
    if (!fourth.ok) {
      expect(fourth.scope).toBe("phone");
    }
  });

  it("blocks the sixth attempt per IP inside the window", () => {
    const now = 3_000_000;
    for (let i = 0; i < 6; i += 1) {
      const result = checkLeadRateLimit(`214555010${i}`, "9.9.9.9", now);
      expect(result.ok).toBe(true);
    }
    const seventh = checkLeadRateLimit("2145550199", "9.9.9.9", now);
    expect(seventh.ok).toBe(false);
    if (!seventh.ok) {
      expect(seventh.scope).toBe("ip");
    }
  });

  it("forgets attempts once the ten minute window passes", () => {
    const start = 4_000_000;
    expect(checkLeadRateLimit("2145550100", "6.6.6.6", start).ok).toBe(true);
    expect(checkLeadRateLimit("2145550100", "6.6.6.6", start).ok).toBe(true);
    expect(checkLeadRateLimit("2145550100", "6.6.6.6", start).ok).toBe(true);

    const later = start + 10 * 60 * 1000 + 1;
    expect(checkLeadRateLimit("2145550100", "6.6.6.6", later).ok).toBe(true);
  });
});

describe("generateReferenceCode", () => {
  it("matches the APX- format with unambiguous characters", () => {
    for (let i = 0; i < 50; i += 1) {
      expect(generateReferenceCode()).toMatch(/^APX-[A-HJ-NP-Z2-9]{6}$/);
    }
  });

  it("varies between calls", () => {
    const codes = new Set(
      Array.from({ length: 20 }, () => generateReferenceCode()),
    );
    expect(codes.size).toBeGreaterThan(1);
  });
});
