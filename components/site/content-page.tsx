import type { ReactNode } from "react";
import { ClosingCta } from "@/components/site/closing-cta";
import { ServiceHero } from "@/components/site/service-hero";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { site } from "@/lib/content/site";

export type ContentSection = {
  eyebrow?: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  links?: { label: string; href: string }[];
};

export type ContentPageData = {
  crumb: string;
  h1: string;
  lede: string;
  heroPrimary?: { label: string; href: string };
  /** Optional metadata line shown above the demo note (season, date). */
  meta?: string;
  disclaimer: string;
  sections: ContentSection[];
  /** Page level link row shown after the sections (service cross links etc). */
  links?: { label: string; href: string }[];
  cta: { title: string; sub: string };
};

/**
 * Shell for the trust, legal and other prose pages: hero, demo honesty
 * note, typed sections, an optional slot (reviews grid, article links),
 * and the closing call to action. Phase 1 tokens only.
 */
export function ContentPage({
  page,
  children,
}: {
  page: ContentPageData;
  children?: ReactNode;
}) {
  return (
    <>
      <ServiceHero
        crumb={page.crumb}
        h1={page.h1}
        lede={page.lede}
        primary={page.heroPrimary ?? { label: "Book a visit", href: "/book" }}
        secondary={{ label: `Call ${site.phoneDisplay}`, href: site.phoneHref }}
      />
      <section className="bg-paper px-5 py-12 lg:px-20 lg:py-[72px]">
        <div className="mx-auto max-w-[920px] space-y-10">
          <div className="space-y-3">
            {page.meta ? (
              <p className="text-[13px] leading-[18px] font-semibold tracking-[0.6px] text-mute">
                {page.meta}
              </p>
            ) : null}
            <p className="rounded-card border border-line bg-sand px-[18px] py-4 text-[13px] leading-[18px] text-soft">
              {page.disclaimer}
            </p>
          </div>
          {page.sections.map((section) => (
            <div key={section.heading}>
              {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
              <h2
                className={`font-display text-[26px] leading-[32px] font-semibold text-ink md:text-[30px] md:leading-[36px] ${
                  section.eyebrow ? "mt-2" : ""
                }`}
              >
                {section.heading}
              </h2>
              {section.paragraphs?.length ? (
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[16px] leading-[25px] text-soft"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}
              {section.bullets ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-copper">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="text-[15px] leading-[22px] text-soft"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.links ? (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {section.links.map((link) => (
                    <ButtonLink
                      key={link.href}
                      href={link.href}
                      variant="ghost"
                    >
                      {link.label}
                    </ButtonLink>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {page.links?.length ? (
            <div className="flex flex-wrap gap-2.5">
              {page.links.map((link) => (
                <ButtonLink
                  key={link.href}
                  href={link.href}
                  variant="ghost"
                >
                  {link.label}
                </ButtonLink>
              ))}
            </div>
          ) : null}
          {children}
        </div>
      </section>
      <ClosingCta title={page.cta.title} sub={page.cta.sub} />
    </>
  );
}
