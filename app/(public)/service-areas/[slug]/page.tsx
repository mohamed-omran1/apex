import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { ClosingCta } from "@/components/site/closing-cta";
import { FaqSection } from "@/components/site/faq-section";
import { ServiceHero } from "@/components/site/service-hero";
import { Chip } from "@/components/ui/chip";
import { cityFromSlug, isAreaSlug } from "@/lib/content/areas";
import { home } from "@/lib/content/home";
import { site } from "@/lib/content/site";
import {
  fallbackCityName,
  getActiveAreaSlugs,
  getAreaBySlug,
} from "@/lib/lead/areas";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/json-ld";
import { publicMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  const slugs = await getActiveAreaSlugs();
  return slugs.map((slug) => ({ slug }));
}

function metadataFor(slug: string, city: string, description: string) {
  return publicMetadata({
    title: `HVAC repair and service in ${city}`,
    description,
    path: `/service-areas/${slug}`,
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/service-areas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const area = await getAreaBySlug(slug);
  if (area) {
    return metadataFor(
      slug,
      area.city,
      area.metaDescription ||
        `Apex serves ${area.city} from the Dallas office: emergency repair, tune-ups and replacement with a written price before any work.`,
    );
  }
  if (!isAreaSlug(slug)) notFound();
  const city = cityFromSlug(slug);
  return metadataFor(
    slug,
    city,
    `Apex serves ${city} from the Dallas office: emergency repair, tune-ups and replacement with a written price before any work.`,
  );
}

export default function AreaPage({
  params,
}: PageProps<"/service-areas/[slug]">) {
  return (
    <Suspense
      fallback={<div className="min-h-[480px] bg-sand" aria-hidden="true" />}
    >
      <AreaDetail params={params} />
    </Suspense>
  );
}

async function AreaDetail({
  params,
}: {
  params: PageProps<"/service-areas/[slug]">["params"];
}) {
  const { slug } = await params;
  const area = await getAreaBySlug(slug);
  if (!area && !isAreaSlug(slug)) notFound();

  const city = area?.city ?? fallbackCityName(slug);
  const lede =
    area?.lede ||
    `Apex serves ${city} from the Dallas office. The full page copy is light right now; the phone and the booking form still work.`;
  const neighborhoods = area?.neighborhoods ?? [];
  const localIssues = area?.localIssues ?? [];
  const priceRange = area?.priceRange ?? "";
  const faqs = area?.faqs ?? [];

  const crumbs = [
    { name: "Service areas", path: "/service-areas" },
    { name: city, path: `/service-areas/${slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {faqs.length > 0 ? <JsonLd data={faqPageJsonLd(faqs)} /> : null}

      <ServiceHero
        crumb={`SERVICE AREAS / ${city.toUpperCase()}`}
        h1={`Serving ${city}. The office stays in Dallas.`}
        lede={lede}
        primary={{ label: "Book a visit", href: "/book" }}
        secondary={{ label: `Call ${site.phoneDisplay}`, href: site.phoneHref }}
      />

      {neighborhoods.length > 0 || localIssues.length > 0 || priceRange ? (
        <section className="bg-sand px-5 pt-3 pb-12 lg:px-20 lg:pb-14">
          <div className="mx-auto max-w-[1440px] space-y-6">
            {neighborhoods.length > 0 ? (
              <ul className="flex flex-wrap gap-2.5">
                {neighborhoods.map((name) => (
                  <Chip key={name} variant="pill">
                    {name}
                  </Chip>
                ))}
              </ul>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              {localIssues.length > 0 ? (
                <div className="rounded-card border border-line bg-paper p-[22px]">
                  <h2 className="font-display text-[26px] leading-[32px] font-semibold text-ink">
                    What we see in {city}
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {localIssues.map((issue) => (
                      <li
                        key={issue}
                        className="text-[15px] leading-[22px] text-soft"
                      >
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {priceRange ? (
                <div className="rounded-card border border-line bg-paper p-[22px]">
                  <h2 className="font-display text-[26px] leading-[32px] font-semibold text-ink">
                    Plain prices
                  </h2>
                  <p className="mt-3 text-[15px] leading-[22px] text-soft">
                    {priceRange}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {faqs.length > 0 ? <FaqSection items={faqs} /> : null}

      <ClosingCta title={home.cta.title} sub={home.cta.sub} />
    </>
  );
}
