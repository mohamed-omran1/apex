import Link from "next/link";
import { site } from "@/lib/content/site";

type FooterColumn =
  | { head: string; links: readonly { label: string; href: string }[] }
  | { head: string; items: readonly string[] };

const columns: FooterColumn[] = [
  { head: "Services", items: site.footer.services },
  { head: "Areas", links: site.footer.areas },
  { head: "Hours", items: site.footer.hours },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink px-5 pt-12 pb-[120px] text-paper lg:px-20 lg:pb-7">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-8 md:grid md:grid-cols-4 md:gap-8">
          <div className="flex flex-col items-start gap-3">
            <p className="font-display text-[22px] font-semibold">Apex</p>
            <p className="max-w-[300px] text-[13px] leading-[18px] text-dust">
              {site.footer.blurb}
            </p>
            <a
              href={site.phoneHref}
              className="text-[15px] font-semibold text-paper"
            >
              {site.phoneDisplay}
            </a>
            <p className="text-[13px] leading-[18px] text-dust">
              {site.address}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.head} className="flex flex-col gap-2.5">
              <p className="text-[14px] font-semibold text-chalk">{col.head}</p>
              <ul className="flex flex-col gap-2">
                {"links" in col
                  ? col.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-[13px] leading-[18px] text-dust hover:text-paper"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))
                  : col.items.map((item) => (
                      <li
                        key={item}
                        className="text-[13px] leading-[18px] text-dust"
                      >
                        {item}
                      </li>
                    ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-graphite pt-[18px]">
          <p className="max-w-[1200px] text-[13px] leading-[18px] text-dust">
            {site.footer.legal}
          </p>
          <nav
            aria-label="Legal"
            className="mt-3 flex flex-wrap gap-x-5 gap-y-2"
          >
            {site.footer.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] leading-[18px] font-medium text-chalk hover:text-paper"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
