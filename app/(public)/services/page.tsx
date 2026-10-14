import type { Metadata } from "next";
import Link from "next/link";
import { ServiceHero } from "@/components/site/service-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { services } from "@/lib/content/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Emergency, AC repair, replacement, heating, tune-ups and indoor air. Six service pages, no franchise menu.",
};

export default function ServicesPage() {
  return (
    <>
      <ServiceHero
        crumb="SERVICES"
        h1="Repair, replace, or just keep it running."
        lede="Six pages. No franchise menu. Emergency is a phone call and four fields. Everything else is a visit with a price before the work."
      />
      <section className="bg-sand px-5 pt-3 pb-12 lg:px-20 lg:pb-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="flex flex-col gap-2 rounded-card border border-line bg-paper p-5 transition-colors hover:border-cedar"
              >
                <Eyebrow size="sm">{service.card.eyebrow}</Eyebrow>
                <h2 className="font-display text-[26px] leading-[30px] font-semibold text-ink">
                  {service.card.title}
                </h2>
                <p className="text-[15px] leading-[22px] text-soft">
                  {service.card.indexBlurb}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
