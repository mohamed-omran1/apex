/** Canonical site origin. Emails and SEO tags use the same source. */
export const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "");

/** Absolute URL for a path such as "/service-areas/plano". */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${clean}`;
}

/**
 * INDEX_SITE flips the demo honesty stance: off (default) keeps noindex and a
 * disallow all robots file, "true" allows crawling and index meta.
 */
export function isIndexingEnabled(): boolean {
  return process.env.INDEX_SITE === "true";
}
