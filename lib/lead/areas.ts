import {
  areaCities,
  areaSlugs,
  isAreaSlug,
  parseAreaFaqs,
} from "@/lib/content/areas";
import { createPublicClient } from "@/lib/supabase/server";

export type ActiveZip = { zip: string; city: string };

export type AreaFaq = { q: string; a: string };

export type AreaRecord = {
  slug: string;
  city: string;
  lede: string;
  metaDescription: string;
  neighborhoods: string[];
  localIssues: string[];
  priceRange: string;
  faqs: AreaFaq[];
};

const areaColumns =
  "slug, city, lede, meta_description, neighborhoods, local_issues, price_range, faqs";

function toAreaRecord(row: {
  slug: string;
  city: string;
  lede: string;
  meta_description: string;
  neighborhoods: string[] | null;
  local_issues: string[] | null;
  price_range: string;
  faqs: unknown;
}): AreaRecord {
  return {
    slug: row.slug,
    city: row.city,
    lede: row.lede,
    metaDescription: row.meta_description,
    neighborhoods: row.neighborhoods ?? [],
    localIssues: row.local_issues ?? [],
    priceRange: row.price_range,
    faqs: parseAreaFaqs(row.faqs),
  };
}

/**
 * Active service zip codes for the booking form, with the city each zip
 * belongs to. Cached with `use cache` because the public routes are static
 * under `ensureStatic = "navigation"`. Returns an empty list when Supabase
 * is not reachable (for example during a CI build with no env), so the page
 * still renders and the zip warning simply stays quiet.
 */
export async function getActiveZips(): Promise<ActiveZip[]> {
  "use cache";
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("service_areas")
      .select("city, zip_codes")
      .eq("is_active", true);
    if (error) {
      console.warn("[areas] zip fetch failed:", error.message);
      return [];
    }
    return (data ?? []).flatMap((area) =>
      area.zip_codes.map((zip) => ({ zip, city: area.city })),
    );
  } catch (error) {
    console.warn(
      "[areas] zip fetch skipped:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/**
 * Active area slugs for `generateStaticParams` and the sitemap. Falls back
 * to the six constants in lib/content/areas.ts when the fetch fails, so a
 * CI build with no Supabase env still produces every area URL.
 */
export async function getActiveAreaSlugs(): Promise<string[]> {
  "use cache";
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("service_areas")
      .select("slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("[areas] slug fetch failed:", error.message);
      }
      return [...areaSlugs];
    }
    return data.map((row) => row.slug);
  } catch (error) {
    console.warn(
      "[areas] slug fetch skipped:",
      error instanceof Error ? error.message : error,
    );
    return [...areaSlugs];
  }
}

/**
 * Full content rows for the active areas, for the /service-areas index.
 * Returns an empty list when Supabase is unreachable; the index page then
 * renders a thin fallback list from the slug constants.
 */
export async function getActiveAreas(): Promise<AreaRecord[]> {
  "use cache";
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("service_areas")
      .select(areaColumns)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) {
      console.warn("[areas] index fetch failed:", error.message);
      return [];
    }
    return (data ?? []).map(toAreaRecord);
  } catch (error) {
    console.warn(
      "[areas] index fetch skipped:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/**
 * One active area row by slug. Returns null when the row is missing or the
 * fetch fails; the page renders its thin state for a known slug and a 404
 * only for slugs that are neither in the database nor in the fallback list.
 */
export async function getAreaBySlug(slug: string): Promise<AreaRecord | null> {
  "use cache";
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("service_areas")
      .select(areaColumns)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) {
      console.warn("[areas] detail fetch failed:", error.message);
      return null;
    }
    if (!data) return null;
    return toAreaRecord(data);
  } catch (error) {
    console.warn(
      "[areas] detail fetch skipped:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/** City display names for the thin state when a row cannot be fetched. */
export function fallbackCityName(slug: string): string {
  return areaCities[slug as keyof typeof areaCities] ?? cityFromSlugFallback(slug);
}

function cityFromSlugFallback(slug: string): string {
  return isAreaSlug(slug)
    ? areaCities[slug]
    : slug.charAt(0).toUpperCase() + slug.slice(1);
}
