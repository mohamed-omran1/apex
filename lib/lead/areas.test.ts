import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { areaSlugs } from "@/lib/content/areas";
import { home } from "@/lib/content/home";

vi.mock("@/lib/supabase/server", () => ({
  createPublicClient: () => {
    throw new Error("forced failure: no database in unit tests");
  },
  createServiceClient: () => {
    throw new Error("forced failure: no database in unit tests");
  },
  createSessionClient: async () => {
    throw new Error("forced failure: no database in unit tests");
  },
}));

import { getActiveAreaSlugs, getAreaBySlug } from "@/lib/lead/areas";

describe("area slug fallbacks", () => {
  it("returns the six constants when the database fetch fails", async () => {
    await expect(getActiveAreaSlugs()).resolves.toEqual([...areaSlugs]);
  });

  it("returns null for a detail fetch that fails", async () => {
    await expect(getAreaBySlug("dallas")).resolves.toBeNull();
  });

  it("keeps the home city cards in sync with the constants", () => {
    expect(home.areas.map((area) => area.slug)).toEqual([...areaSlugs]);
  });

  it("keeps the seed file in sync with the constants", () => {
    const seed = readFileSync(
      join(import.meta.dirname, "../../supabase/seed.sql"),
      "utf8",
    );
    for (const slug of areaSlugs) {
      expect(seed).toContain(`'${slug}'`);
    }
  });
});
