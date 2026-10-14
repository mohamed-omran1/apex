import Image from "next/image";
import Link from "next/link";
import { ClosingCta } from "@/components/site/closing-cta";
import { FaqSection } from "@/components/site/faq-section";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Stars } from "@/components/ui/stars";
import { home } from "@/lib/content/home";
import { services } from "@/lib/content/services";
import { site } from "@/lib/content/site";

export default function HomePage() {
  return (
    <>
      <section className="bg-sand px-5 pt-5 pb-3 lg:px-20 lg:py-14">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 lg:flex-row lg:items-center lg:gap-8 lg:min-[1400px]:gap-12">
          <div className="flex max-w-[620px] flex-col gap-4 lg:flex-1 lg:min-w-0 lg:gap-[18px]">
            <p className="-mb-1 flex items-center gap-2 text-[14px] leading-[18px] text-cedar md:mb-0 md:text-[15px] md:leading-5">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-live"
              />
              {home.hero.status}
              <span className="hidden md:inline">
                {" "}
                · {home.hero.statusMeta}
              </span>
            </p>
            <h1 className="-mb-1 font-display text-[36px] leading-[40px] font-semibold text-ink md:mb-0 md:text-[64px] md:leading-[68px] lg:text-[40px] lg:leading-[46px] lg:min-[1400px]:text-[64px] lg:min-[1400px]:leading-[68px]">
              {home.hero.h1}
            </h1>
            <p className="text-[16px] leading-[22px] text-soft md:text-[18px] md:leading-[28px]">
              <span className="md:hidden">{home.hero.ledeMobile}</span>
              <span className="hidden md:inline">{home.hero.lede}</span>
            </p>
            <div className="flex flex-col gap-3.5 lg:flex-row lg:gap-2.5">
              <ButtonLink href={site.phoneHref} variant="primary">
                Call {site.phoneDisplay}
              </ButtonLink>
              <ButtonLink href="/book" variant="ghost">
                Book a visit
              </ButtonLink>
            </div>
            <div className="-mt-1 flex flex-wrap items-center gap-2 lg:mt-0">
              <Stars />
              <span className="text-[14px] text-mute">
                <span className="md:font-semibold md:text-ink">
                  {home.hero.rating}
                </span>{" "}
                <span className="md:hidden">{home.hero.ratingNoteMobile}</span>
                <span className="hidden md:inline">
                  {home.hero.ratingNote}
                </span>
              </span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[592px] lg:mx-0 lg:w-[46%] lg:max-w-[592px] lg:shrink-0 lg:min-[1400px]:w-[592px]">
            <Image
              src={home.hero.image}
              alt={home.hero.imageAlt}
              width={1792}
              height={1008}
              priority
              sizes="(max-width: 1024px) calc(100vw - 40px), 592px"
              fetchPriority="high"
              className="aspect-[4/3] w-full rounded-[16px] object-cover lg:h-[500px] lg:rounded-[22px]"
            />
            <div className="absolute inset-x-5 bottom-5 hidden rounded-[12px] bg-paper p-4 lg:block">
              <p className="text-[13px] leading-[18px] font-medium text-soft">
                {home.hero.caption.eyebrow}
              </p>
              <p className="mt-1 font-display text-[22px] leading-[28px] font-semibold text-ink">
                {home.hero.caption.title}
              </p>
              <p className="mt-1 text-[13px] leading-[18px] text-mute">
                {home.hero.caption.body}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-20">
          <div className="grid grid-cols-1 divide-y divide-line border-y border-line lg:grid-cols-4 lg:divide-x lg:divide-y-0 lg:border-x">
            {home.trust.map((item) => (
              <div key={item.title} className="px-[22px] py-[22px]">
                <p className="text-[15px] leading-5 font-semibold text-ink">
                  {item.title}
                </p>
                <p className="mt-1 text-[13px] leading-[18px] text-soft">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand px-5 pt-10 pb-6 lg:px-20 lg:pt-[72px] lg:pb-7">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="max-w-[660px]">
              <Eyebrow>{home.servicesHead.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-display text-[30px] leading-[36px] font-semibold text-ink md:text-[40px] md:leading-[46px]">
                {home.servicesHead.heading}
              </h2>
            </div>
            <p className="max-w-[360px] text-[15px] leading-[22px] text-soft">
              {home.servicesHead.note}
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="flex flex-col gap-2 rounded-card border border-line bg-paper p-[22px] transition-colors hover:border-cedar"
              >
                <Eyebrow size="sm">{service.card.eyebrow}</Eyebrow>
                <h3 className="font-display text-[26px] leading-[30px] font-semibold text-ink">
                  {service.card.title}
                </h3>
                <p className="text-[15px] leading-[22px] text-soft">
                  {service.card.homeBlurb}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-4 grid gap-6 rounded-panel bg-deep p-6 sm:grid-cols-3 lg:p-7">
            {home.priceBand.map((item) => (
              <div key={item.label} className="flex flex-col">
                <p className="font-display text-[32px] leading-[38px] font-semibold text-paper">
                  {item.value}
                </p>
                <p className="mt-1 text-[13px] leading-[18px] text-mint">
                  {item.label}
                </p>
                <p className="mt-1 text-[13px] leading-[18px] text-mist">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-12 lg:px-20 lg:py-[72px]">
        <div className="mx-auto max-w-[1440px] space-y-14">
          <div>
            <Eyebrow>{home.stepsHead.eyebrow}</Eyebrow>
            <h2 className="mt-3 max-w-[900px] font-display text-[30px] leading-[36px] font-semibold text-ink md:text-[40px] md:leading-[46px]">
              {home.stepsHead.heading}
            </h2>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {home.steps.map((step) => (
                <div
                  key={step.n}
                  className="flex flex-col gap-2 rounded-card bg-sand p-[22px]"
                >
                  <p className="font-display text-[32px] leading-[38px] font-semibold text-copper">
                    {step.n}
                  </p>
                  <h3 className="text-[18px] leading-6 font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-[22px] text-soft">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div id="reviews">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Eyebrow>{home.reviewsHead.eyebrow}</Eyebrow>
                <h2 className="mt-3 font-display text-[30px] leading-[36px] font-semibold text-ink md:text-[40px] md:leading-[46px]">
                  {home.reviewsHead.heading}
                </h2>
              </div>
              <p className="max-w-[320px] text-[13px] leading-[18px] text-mute">
                {home.reviewsHead.note}
              </p>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {home.reviews.map((review) => (
                <article
                  key={review.name}
                  className="flex flex-col gap-3 rounded-card border border-line bg-paper p-[18px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Stars />
                    <span className="rounded-full bg-sample px-2 py-1 text-[10px] font-semibold tracking-[0.6px] text-copper">
                      SAMPLE
                    </span>
                  </div>
                  <blockquote className="font-display text-[18px] leading-[26px] italic text-ink">
                    {review.quote}
                  </blockquote>
                  <div>
                    <p className="text-[14px] font-semibold text-ink">
                      {review.name}
                    </p>
                    <p className="text-[13px] leading-[18px] text-mute">
                      {review.meta}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="areas" className="bg-sand px-5 py-12 lg:px-20 lg:py-[72px]">
        <div className="mx-auto max-w-[1440px]">
          <Eyebrow>{home.areasHead.eyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-[900px] font-display text-[30px] leading-[36px] font-semibold text-ink md:text-[40px] md:leading-[46px]">
            {home.areasHead.heading}
          </h2>
          <p className="mt-3 max-w-[720px] text-[16px] leading-[24px] text-soft">
            {home.areasHead.lede}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {home.areas.map((area) => (
              <div
                key={area.name}
                className="flex flex-col gap-2 rounded-card border border-line bg-paper p-[18px]"
              >
                <h3 className="font-display text-[26px] leading-[30px] font-semibold text-ink">
                  {area.name}
                </h3>
                <p className="text-[14px] leading-[20px] text-soft">
                  {area.body}
                </p>
              </div>
            ))}
          </div>
          <div
            id="membership"
            className="mt-6 flex flex-col gap-5 rounded-panel bg-sage p-7 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="max-w-[720px]">
              <p className="text-[11px] font-semibold tracking-[1px] text-cedar">
                {home.membership.eyebrow}
              </p>
              <h3 className="mt-2 font-display text-[26px] leading-[32px] font-semibold text-ink md:text-[30px] md:leading-[36px]">
                {home.membership.heading}
              </h3>
              <p className="mt-2 text-[15px] leading-[22px] text-soft">
                {home.membership.body}
              </p>
            </div>
            <ButtonLink href="/book" variant="primary">
              {home.membership.cta}
            </ButtonLink>
          </div>
        </div>
      </section>

      <FaqSection heading={home.faq.heading} items={home.faq.items} />

      <ClosingCta title={home.cta.title} sub={home.cta.sub} size="home" />
    </>
  );
}
