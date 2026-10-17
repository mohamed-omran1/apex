import { z } from "zod";

/**
 * The six active service area slugs. One constant list: the seed in
 * `supabase/seed.sql` writes these slugs, `generateStaticParams` falls back
 * to them when Supabase is unreachable, and the JSON-LD `areaServed` list is
 * built from the same names. Keep the two in sync (phase-5 AC-1).
 */
export const areaSlugs = [
  "dallas",
  "plano",
  "irving",
  "garland",
  "richardson",
  "frisco",
] as const;

export type AreaSlug = (typeof areaSlugs)[number];

export const areaCities: Record<AreaSlug, string> = {
  dallas: "Dallas",
  plano: "Plano",
  irving: "Irving",
  garland: "Garland",
  richardson: "Richardson",
  frisco: "Frisco",
};

export function isAreaSlug(slug: string): slug is AreaSlug {
  return (areaSlugs as readonly string[]).includes(slug);
}

/** City display name from a slug, for the thin state when a row is missing. */
export function cityFromSlug(slug: string): string {
  if (isAreaSlug(slug)) return areaCities[slug];
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** FAQ entries validated on read; malformed pairs are dropped, never crash. */
export const areaFaqSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

export function parseAreaFaqs(value: unknown): { q: string; a: string }[] {
  if (!Array.isArray(value)) return [];
  const parsed = z.array(areaFaqSchema).safeParse(value);
  if (!parsed.success) return [];
  return parsed.data;
}
