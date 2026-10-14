import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { site } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Book a visit",
  description:
    "Request a repair or estimate window. Online booking is not live in this demo yet — call and the owner picks up.",
};

export default function BookPage() {
  return (
    <section className="bg-sand px-5 py-14 lg:px-20 lg:py-24">
      <div className="mx-auto flex max-w-[720px] flex-col gap-4">
        <Eyebrow>BOOKING</Eyebrow>
        <h1 className="font-display text-[36px] leading-[40px] font-semibold text-ink md:text-[48px] md:leading-[54px]">
          The four-field form arrives in Phase 3.
        </h1>
        <p className="text-[17px] leading-[26px] text-soft">
          Booking wires the request into the owner&apos;s inbox. Until it ships,
          call {site.phoneDisplay} — the line is answered around the clock — and
          leave the address and the window you want.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <ButtonLink href={site.phoneHref} variant="primary">
            Call {site.phoneDisplay}
          </ButtonLink>
          <ButtonLink href="/" variant="ghost">
            Back to the home page
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
