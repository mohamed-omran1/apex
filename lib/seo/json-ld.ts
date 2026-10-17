import { areaCities, areaSlugs } from "@/lib/content/areas";
import { site } from "@/lib/content/site";
import { absoluteUrl } from "@/lib/seo/url";

export type FaqPair = { q: string; a: string };

export type BreadcrumbItem = { name: string; path: string };

/**
 * Structured data builders (phase 5 AC-8). Payloads are built from the
 * site.ts constants and the same values the pages render, so the JSON-LD
 * always matches visible text. The JsonLd component escapes the payload
 * before it is written into the script tag.
 */

function parseAddress(address: string): {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
} {
  const parts = address.split(",").map((part) => part.trim());
  const last = parts[parts.length - 1] ?? "";
  const [region, postalCode] = last.split(/\s+/);
  return {
    streetAddress: parts[0] ?? "",
    addressLocality: parts[1] ?? "",
    addressRegion: region ?? "",
    postalCode: postalCode ?? "",
  };
}

export function hvacBusinessJsonLd() {
  const address = parseAddress(site.address);
  const telephone = site.phoneHref.replace(/^tel:/, "");

  return {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    "@id": absoluteUrl("/#hvacbusiness"),
    name: site.name,
    url: absoluteUrl("/"),
    telephone,
    image: absoluteUrl("/images/og.png"),
    license: site.license,
    address: {
      "@type": "PostalAddress",
      ...address,
      addressCountry: "US",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "07:00",
        closes: "19:00",
      },
    ],
    areaServed: areaSlugs.map((slug) => ({
      "@type": "City",
      name: areaCities[slug],
    })),
    priceRange: "$$",
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqPageJsonLd(items: readonly FaqPair[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
