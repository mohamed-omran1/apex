import type { Metadata } from "next";
import { ContentPage } from "@/components/site/content-page";
import { legalPages } from "@/lib/content/legal";
import { publicMetadata } from "@/lib/seo/metadata";

const content = legalPages.privacy;

export const metadata: Metadata = publicMetadata({
  title: content.title,
  description: content.description,
  path: content.path,
});

export default function PrivacyPage() {
  return <ContentPage page={content} />;
}
