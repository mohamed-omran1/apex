import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { ContentPage } from "@/components/site/content-page";
import { articleSlugs, formatArticleDate, getArticle } from "@/lib/content/articles";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { publicMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return articleSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tips/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return publicMetadata({
    title: article.title,
    description: article.description,
    path: `/tips/${article.slug}`,
    type: "article",
  });
}

export default async function ArticlePage({
  params,
}: PageProps<"/tips/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const content = {
    ...article,
    meta: `${article.season} · Published ${formatArticleDate(article.published_on)}`,
  };

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Tips", path: "/tips" },
          { name: article.title, path: `/tips/${article.slug}` },
        ])}
      />
      <ContentPage page={content} />
    </>
  );
}
