import Link from "next/link";
import { site } from "@/lib/content/site";
import { PhoneIcon } from "@/components/ui/phone-icon";
import { Logo } from "@/components/site/logo";

export function SiteHeader() {
  return (
    <header className="border-y border-line bg-paper">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-4 py-2.5 lg:px-20 lg:py-3.5">
        <Logo />
        <nav
          aria-label="Primary"
          className="hidden items-center gap-[26px] lg:flex"
        >
          {site.nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[15px] font-medium text-ink hover:text-cedar"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={site.phoneHref}
            className="inline-flex h-[38px] items-center gap-1.5 rounded-full bg-sage px-3.5 text-[15px] font-semibold text-cedar hover:bg-sage/80"
          >
            <PhoneIcon className="size-4" />
            {site.phoneDisplay}
          </a>
          <Link
            href="/book"
            className="inline-flex h-[42px] items-center justify-center rounded-full bg-cedar px-[15px] text-[15px] font-semibold text-paper transition-colors hover:bg-deep"
          >
            Book service
          </Link>
        </div>
        <a
          href={site.phoneHref}
          aria-label={`Call ${site.phoneDisplay}`}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cedar text-paper hover:bg-deep lg:hidden"
        >
          <PhoneIcon className="size-5" />
        </a>
      </div>
    </header>
  );
}
