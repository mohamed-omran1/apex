import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexingEnabled } from "@/lib/seo/url";

/**
 * Demo honesty first: INDEX_SITE unset (the default) disallows all crawling
 * while still publishing the complete sitemap. INDEX_SITE=true allows it,
 * matching the root metadata robots flip in app/layout.tsx.
 */
export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl("/sitemap.xml");

  if (!isIndexingEnabled()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      sitemap,
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap,
  };
}
