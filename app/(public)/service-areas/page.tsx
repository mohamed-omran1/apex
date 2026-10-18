import type { Metadata } from "next";
import Link from "next/link";
import { ServiceHero } from "@/components/site/service-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import { areaCities, areaSlugs } from "@/lib/content/areas";
import { getActiveAreas } from "@/lib/lead/areas";
import { publicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = publicMetadata({
  title: "Service areas",
  description:
    "The six cities Apex serves across the metro: Dallas, Plano, Irving, Garland, Richardson and Frisco. One office in Dallas, a written price before any work.",
  path: "/service-areas",
});

function fallbackBlurb(city: string): string {
  return `Apex serves ${city} from the Dallas office. Neighborhoods, what we see locally, a plain price range and local answers live on the page.`;
}

export default async function ServiceAreasPage() {
  const areas = await getActiveAreas();
  const cards =
    areas.length > 0
      ? areas.map((area) => ({
          slug: area.slug,
          city: area.city,
          blurb: area.metaDescription || fallbackBlurb(area.city),
        }))
      : areaSlugs.map((slug) => ({
          slug,
          city: areaCities[slug],
          blurb: fallbackBlurb(areaCities[slug]),
        }));

  return (
    <>
      <ServiceHero
        crumb="SERVICE AREAS"
        h1="Six cities. One office in Dallas."
        lede="The same crew and the same written price in every city we drive to. Each page names the neighborhoods, what usually breaks there, a plain price range, and the questions people actually ask."
      />
      <section className="bg-sand px-5 pt-3 pb-12 lg:px-20 lg:pb-14">
        <div className="mx-auto max-w-[1440px]">
          {cards.length === 0 ? (
            <EmptyState
              title="No areas listed yet."
              body="We still serve the metro from the Dallas office. Call and we will confirm your address."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Link
                  key={card.slug}
                  href={`/service-areas/${card.slug}`}
                  className="flex flex-col gap-2 rounded-card border border-line bg-paper p-[22px] transition-colors hover:border-cedar"
                >
                  <Eyebrow size="sm">SERVING</Eyebrow>
                  <h2 className="font-display text-[26px] leading-[30px] font-semibold text-ink">
                    {card.city}
                  </h2>
                  <p className="text-[15px] leading-[22px] text-soft">
                    {card.blurb}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
