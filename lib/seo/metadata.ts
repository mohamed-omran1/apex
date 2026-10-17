import type { Metadata } from "next";
import { site } from "@/lib/content/site";
import { absoluteUrl } from "@/lib/seo/url";

/** One shared social card, phase 5 AC-10. */
export const OG_IMAGE_PATH = "/images/og.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * Metadata for every public page: title template, description, canonical
 * from SITE_URL, Open Graph and Twitter card pointing at the static PNG.
 * The root layout supplies the robots value, so pages do not repeat it.
 */
export function publicMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const image = absoluteUrl(OG_IMAGE_PATH);
  const fullTitle = `${title} | ${site.name}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: site.name,
      type,
      images: [
        {
          url: image,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
