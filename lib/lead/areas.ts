import { createPublicClient } from "@/lib/supabase/server";

export type ActiveZip = { zip: string; city: string };

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
