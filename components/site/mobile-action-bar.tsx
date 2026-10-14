import { site } from "@/lib/content/site";
import { ButtonLink } from "@/components/ui/button";

export function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-paper px-3 pt-2.5 pb-[21px] lg:hidden">
      <ButtonLink
        href={site.phoneHref}
        variant="primary"
        className="flex-1 py-4"
      >
        Call
      </ButtonLink>
      <ButtonLink href="/book" variant="ghost" className="flex-1 py-4">
        Book
      </ButtonLink>
    </div>
  );
}
