import { JsonLd } from "@/components/seo/json-ld";
import { DemoBar, OfferBar } from "@/components/site/bars";
import { MobileActionBar } from "@/components/site/mobile-action-bar";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { hvacBusinessJsonLd } from "@/lib/seo/json-ld";

export const ensureStatic = "navigation";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <JsonLd data={hvacBusinessJsonLd()} />
      <DemoBar />
      <OfferBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
