import type { MetadataRoute } from "next";
import { articleSlugs } from "@/lib/content/articles";
import { serviceSlugs } from "@/lib/content/services";
import { trustPages, trustSlugs } from "@/lib/content/trust";
import { legalPages, legalSlugs } from "@/lib/content/legal";
import { getActiveAreaSlugs } from "@/lib/lead/areas";
import { absoluteUrl } from "@/lib/seo/url";

/**
 * Every public URL from AC-9. Area slugs come from the database with the six
 * constant fallbacks, so the sitemap stays complete without a live Supabase
 * connection. The list ships even while INDEX_SITE keeps robots on disallow.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const areaSlugs = await getActiveAreaSlugs();

  const paths: string[] = [
    "/",
    "/book",
    "/services",
    ...serviceSlugs.map((slug) => `/services/${slug}`),
    "/service-areas",
    ...areaSlugs.map((slug) => `/service-areas/${slug}`),
    ...trustSlugs.map((slug) => trustPages[slug].path),
    ...legalSlugs.map((slug) => legalPages[slug].path),
    "/tips",
    ...articleSlugs.map((slug) => `/tips/${slug}`),
  ];

  return paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.split("/").length > 2 ? 0.6 : 0.8,
  }));
}
