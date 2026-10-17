import { createPublicClient } from "@/lib/supabase/server";

export type PublishedReview = {
  id: string;
  name: string;
  rating: number;
  body: string;
  reviewedOn: string;
  isSample: boolean;
};

/**
 * Published reviews for the public /reviews page. RLS allows anon SELECT on
 * rows where is_published, so no auth is involved. Cached for static pages;
 * an empty array on failure feeds the page's empty state.
 */
export async function getPublishedReviews(): Promise<PublishedReview[]> {
  "use cache";
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, name, rating, body, reviewed_on, is_sample")
      .eq("is_published", true)
      .order("reviewed_on", { ascending: false });
    if (error) {
      console.warn("[reviews] fetch failed:", error.message);
      return [];
    }
    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      rating: row.rating,
      body: row.body,
      reviewedOn: row.reviewed_on,
      isSample: row.is_sample,
    }));
  } catch (error) {
    console.warn(
      "[reviews] fetch skipped:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/**
 * "2026-09-12" to "Sep 12" without timezone drift: build the date from the
 * parts instead of parsing the string as UTC midnight.
 */
export function formatReviewDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}
