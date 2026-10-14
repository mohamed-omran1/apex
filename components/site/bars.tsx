import { site } from "@/lib/content/site";

export function DemoBar() {
  return (
    <div className="bg-ink px-4 py-1 text-center text-[11px] leading-[16px] text-sand lg:py-2 lg:text-[13px]">
      <span className="lg:hidden">{site.noticeMobile}</span>
      <span className="hidden lg:inline">{site.demoNoticeDesktop}</span>
    </div>
  );
}

export function OfferBar() {
  return (
    <div className="bg-cedar px-4 py-2 lg:px-20 lg:py-2.5">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-4 lg:justify-between">
        <p className="text-center text-[12px] font-medium leading-[16px] whitespace-pre-wrap text-paper lg:text-left lg:text-[14px] lg:leading-[17px]">
          <span className="lg:hidden">{site.offer.mobile}</span>
          <span className="hidden lg:inline">{site.offer.desktop}</span>
        </p>
        <p className="hidden shrink-0 text-[13px] font-semibold leading-[16px] text-peach lg:block">
          {site.offer.ends}
        </p>
      </div>
    </div>
  );
}
