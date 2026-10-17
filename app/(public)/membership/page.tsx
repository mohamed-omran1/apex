import type { Metadata } from "next";
import { ContentPage } from "@/components/site/content-page";
import { trustPages } from "@/lib/content/trust";
import { publicMetadata } from "@/lib/seo/metadata";

const content = trustPages.membership;

export const metadata: Metadata = publicMetadata({
  title: content.title,
  description: content.description,
  path: content.path,
});

export default function MembershipPage() {
  return <ContentPage page={content} />;
}
