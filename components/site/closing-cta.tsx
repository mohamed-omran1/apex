import { site } from "@/lib/content/site";
import { ButtonLink } from "@/components/ui/button";

export function ClosingCta({
  title,
  sub,
  size = "service",
}: {
  title: string;
  sub: string;
  size?: "service" | "home";
}) {
  const heading =
    size === "home"
      ? "text-[32px] leading-[38px] md:text-[48px] md:leading-[54px]"
      : "text-[28px] leading-[34px] md:text-[36px] md:leading-[42px]";

  return (
    <section className="bg-deep px-5 py-12 lg:px-20 lg:py-16">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
        <h2
          className={`max-w-[900px] font-display font-semibold text-paper ${heading}`}
        >
          {title}
        </h2>
        <p className="max-w-[720px] text-[16px] leading-[24px] text-mint lg:text-[18px] lg:leading-[26px]">
          {sub}
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <ButtonLink href={site.phoneHref} variant="light">
            Call {site.phoneDisplay}
          </ButtonLink>
          <ButtonLink href="/book" variant="outlineLight">
            Book a visit
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
