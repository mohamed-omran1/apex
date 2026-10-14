import { Eyebrow } from "@/components/ui/eyebrow";

export function FaqSection({
  heading,
  items,
}: {
  heading?: string;
  items: readonly { q: string; a: string }[];
}) {
  return (
    <section className="bg-paper px-5 pt-12 pb-14 lg:px-20 lg:pt-[72px] lg:pb-16">
      <div className="mx-auto max-w-[1440px]">
        <Eyebrow>QUESTIONS</Eyebrow>
        {heading ? (
          <h2 className="mt-3 max-w-[900px] font-display text-[30px] leading-[36px] font-semibold text-ink md:text-[40px] md:leading-[46px]">
            {heading}
          </h2>
        ) : null}
        <div className="mt-8 border-b border-line">
          {items.map((item) => (
            <div key={item.q} className="border-t border-line py-[18px]">
              <h3 className="text-[18px] leading-[24px] font-semibold text-ink">
                {item.q}
              </h3>
              <p className="mt-1.5 max-w-[1100px] text-[15px] leading-[22px] text-soft">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
