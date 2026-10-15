import Link from "next/link";
import { signOut } from "@/actions/auth";

const navItems = [
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminSidebar({
  email,
  emergencyMode,
  emergencyBanner,
  pathname,
}: {
  email: string;
  emergencyMode: boolean;
  emergencyBanner: string | null;
  pathname: string;
}) {
  return (
    <aside className="flex w-[232px] shrink-0 flex-col gap-1.5 bg-deep px-4 pt-[22px] pb-5 text-paper min-md:min-h-screen">
      <Link href="/admin/inbox" className="mb-0.5 block px-2">
        <span className="font-display text-[24px] font-semibold text-paper">
          Apex
        </span>
        <span className="mt-0.5 block text-[11px] font-medium tracking-[1.4px] text-mist">
          OWNER DESK
        </span>
      </Link>

      <nav className="mt-4 flex flex-col gap-1" aria-label="Admin">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition-colors ${
                active
                  ? "bg-[#173E33] text-paper"
                  : "text-mist hover:bg-[#173E33]/60 hover:text-paper"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Emergency mode panel, present on every admin screen. */}
      <div className="mt-5 rounded-[14px] bg-[#173E33] p-3">
        <p className="text-[11px] font-medium tracking-[1.2px] text-mist">
          EMERGENCY MODE
        </p>
        <p
          className={`mt-2 inline-flex items-center gap-2 text-[13px] font-medium ${
            emergencyMode ? "text-peach" : "text-mist"
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${
              emergencyMode ? "bg-live" : "bg-mist/50"
            }`}
          />
          {emergencyMode ? "Line open" : "Off"}
        </p>
        {emergencyMode && emergencyBanner ? (
          <p className="mt-2 text-[12px] leading-[17px] text-mist">
            {emergencyBanner}
          </p>
        ) : null}
        <Link
          href="/admin/settings"
          className="mt-3 inline-block text-[12px] font-medium text-peach hover:underline"
        >
          Change in settings
        </Link>
      </div>

      {/* Who block */}
      <div className="mt-auto border-t border-graphite pt-[18px]">
        <p className="px-2 text-[12px] leading-[16px] text-mist">Signed in</p>
        <p className="mt-0.5 truncate px-2 text-[13px] font-medium text-paper">
          {email}
        </p>
        <form action={signOut} className="mt-3 px-2">
          <button
            type="submit"
            className="rounded-full border border-graphite px-3 py-1.5 text-[12px] font-medium text-mist transition-colors hover:border-mist hover:text-paper"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
