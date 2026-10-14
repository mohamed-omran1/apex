import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ClosingCta } from "@/components/site/closing-cta";
import { FaqSection } from "@/components/site/faq-section";
import { ServiceHero } from "@/components/site/service-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Chip } from "@/components/ui/chip";
import { getService, serviceSlugs } from "@/lib/content/services";

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return { title: service.card.title, description: service.lede };
}

export default function ServiceDetailPage({
  params,
}: PageProps<"/services/[slug]">) {
  return (
    <Suspense
      fallback={<div className="min-h-[480px] bg-sand" aria-hidden="true" />}
    >
      <ServiceDetail params={params} />
    </Suspense>
  );
}

async function ServiceDetail({
  params,
}: {
  params: PageProps<"/services/[slug]">["params"];
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <ServiceHero
        crumb={service.crumb}
        h1={service.h1}
        lede={service.lede}
        primary={service.primary}
        secondary={service.secondary}
        image={service.heroImage}
      />

      <section className="bg-sand px-5 pt-7 pb-9 lg:px-20 lg:pt-10 lg:pb-12">
        <div className="mx-auto max-w-[1440px] space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            {service.cards.map((card) => (
              <div
                key={card.title}
                className={`rounded-card border border-line p-[22px] ${
                  card.tone === "sage" ? "bg-sage" : "bg-paper"
                }`}
              >
                <h2 className="font-display text-[26px] leading-[32px] font-semibold text-ink">
                  {card.title}
                </h2>
                <p className="mt-2 text-[15px] leading-[22px] text-soft">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
          {service.chips ? (
            <ul className="grid items-start gap-3 md:grid-cols-2 lg:grid-cols-4">
              {service.chips.map((chip) => (
                <Chip key={chip}>{chip}</Chip>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {service.included ? (
        <section className="bg-paper px-5 pt-9 pb-10 lg:px-20 lg:pt-9 lg:pb-10">
          <div className="mx-auto max-w-[1440px]">
            <Eyebrow>{service.included.eyebrow}</Eyebrow>
            <h2 className="mt-2 max-w-[900px] font-display text-[28px] leading-[34px] font-semibold text-ink md:text-[32px] md:leading-[38px]">
              {service.included.heading}
            </h2>
            <ul className="mt-5 grid items-start gap-3 md:grid-cols-2 lg:grid-cols-4">
              {service.included.chips.map((chip) => (
                <Chip key={chip} tone="sand">
                  {chip}
                </Chip>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <FaqSection items={service.faqs} />

      <ClosingCta title={service.cta.title} sub={service.cta.sub} />
    </>
  );
}
