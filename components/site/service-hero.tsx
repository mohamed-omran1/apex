import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { ServiceAction } from "@/lib/content/services";

export function ServiceHero({
  crumb,
  h1,
  lede,
  primary,
  secondary,
  image,
}: {
  crumb: string;
  h1: string;
  lede: string;
  primary?: ServiceAction;
  secondary?: ServiceAction;
  image?: { src: string; alt: string };
}) {
  return (
    <section className="bg-sand px-5 pt-8 pb-4 lg:px-20 lg:pt-12 lg:pb-2">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 lg:flex-row lg:items-center">
        <div className="flex max-w-[640px] flex-col gap-3.5 lg:flex-1 lg:min-w-0">
          <Eyebrow>{crumb}</Eyebrow>
          <h1 className="font-display text-[36px] leading-[40px] font-semibold text-ink md:text-[48px] md:leading-[54px]">
            {h1}
          </h1>
          <p className="max-w-[580px] text-[17px] leading-[26px] text-soft">
            {lede}
          </p>
          {primary || secondary ? (
            <div className="mt-2 flex flex-wrap gap-2.5">
              {primary ? (
                <ButtonLink href={primary.href} variant="primary">
                  {primary.label}
                </ButtonLink>
              ) : null}
              {secondary ? (
                <ButtonLink href={secondary.href} variant="ghost">
                  {secondary.label}
                </ButtonLink>
              ) : null}
            </div>
          ) : null}
        </div>
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={1600}
            height={1200}
            priority
            sizes="(max-width: 1024px) calc(100vw - 40px), 520px"
            fetchPriority="high"
            className="h-[280px] w-full rounded-[16px] object-cover lg:h-[360px] lg:w-[46%] lg:max-w-[520px] lg:shrink-0 lg:rounded-[20px]"
          />
        ) : null}
      </div>
    </section>
  );
}
