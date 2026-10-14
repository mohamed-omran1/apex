import { DemoBar, OfferBar } from "@/components/site/bars";
import { MobileActionBar } from "@/components/site/mobile-action-bar";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const ensureStatic = "navigation";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <DemoBar />
      <OfferBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
