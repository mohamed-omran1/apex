import type { Metadata } from "next";
import { RecoveryLinks } from "@/components/site/recovery-links";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page is not on this site.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-sand px-6 text-center">
      <p className="text-[13px] font-semibold tracking-[1.2px] text-copper">
        404
      </p>
      <h1 className="font-display text-[36px] font-semibold text-ink">
        This page is not here.
      </h1>
      <p className="max-w-[360px] text-[15px] leading-[22px] text-soft">
        The link may be old, or the address may have a typo. You can call us,
        book a visit, or head back home.
      </p>
      <RecoveryLinks />
    </main>
  );
}
