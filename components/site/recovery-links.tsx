import Link from "next/link";
import { site } from "@/lib/content/site";

export function RecoveryLinks({ retryHref }: { retryHref?: string }) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
      <Link
        href="/"
        className="rounded-full bg-cedar px-5 py-3 text-[14px] font-semibold text-paper hover:bg-deep"
      >
        Back home
      </Link>
      <a
        href={site.phoneHref}
        className="rounded-full border-[1.5px] border-cedar bg-paper px-5 py-3 text-[14px] font-semibold text-cedar hover:bg-sage"
      >
        Call {site.phoneDisplay}
      </a>
      <Link
        href={retryHref ?? "/book"}
        className="rounded-full border-[1.5px] border-cedar bg-paper px-5 py-3 text-[14px] font-semibold text-cedar hover:bg-sage"
      >
        Book service
      </Link>
    </div>
  );
}
