import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { ServiceHero } from "@/components/site/service-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { articles, formatArticleDate } from "@/lib/content/articles";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { publicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = publicMetadata({
  title: "Tips",
  description:
    "Three seasonal HVAC articles: the spring AC tune-up checklist, five checks when the AC is not cooling, and the fall furnace check.",
  path: "/tips",
});

export default function TipsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Tips", path: "/tips" },
        ])}
      />
      <ServiceHero
        crumb="TIPS"
        h1="Seasonal checks, written down."
        lede="Three articles, one per season, in the order the year actually breaks systems. Read them before the heat, not during it."
      />
      <section className="bg-sand px-5 pt-3 pb-12 lg:px-20 lg:pb-14">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/tips/${article.slug}`}
                className="flex flex-col gap-2 rounded-card border border-line bg-paper p-[22px] transition-colors hover:border-cedar"
              >
                <Eyebrow size="sm">{article.season.toUpperCase()}</Eyebrow>
                <h2 className="font-display text-[26px] leading-[30px] font-semibold text-ink">
                  {article.title}
                </h2>
                <p className="text-[15px] leading-[22px] text-soft">
                  {article.description}
                </p>
                <p className="mt-1 text-[13px] leading-[18px] text-mute">
                  {formatArticleDate(article.published_on)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
