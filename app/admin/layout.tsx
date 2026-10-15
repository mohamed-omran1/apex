import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { AdminSidebarClient } from "@/components/admin/admin-sidebar-client";
import { createSessionClient, isAdminUser } from "@/lib/supabase/server";

// Admin reads the session from cookies and must never be prerendered.
// Cache Components replaced the old dynamic segment config with this flag.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Owner desk · Apex", template: "%s · Apex owner desk" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headerList = await headers();
  const pathname = headerList.get("x-admin-pathname") ?? "";
  const onSignIn = pathname === "/admin/sign-in";
  if (!onSignIn && (!user || !isAdminUser(user))) {
    redirect("/admin/sign-in");
  }
  if (onSignIn && user && isAdminUser(user)) {
    redirect("/admin/inbox");
  }

  // Sign-in renders alone: no session yet, so no sidebar to show.
  if (!user || !isAdminUser(user)) {
    return <>{children}</>;
  }

  const { data: settings } = await supabase
    .from("site_settings")
    .select("emergency_mode, emergency_banner")
    .eq("id", true)
    .maybeSingle();

  return (
    <div className="flex min-h-dvh flex-col bg-sand min-md:flex-row">
      <div className="sticky top-0 hidden h-dvh min-md:block">
        <AdminSidebarClient
          email={user.email ?? "admin"}
          emergencyMode={settings?.emergency_mode ?? false}
          emergencyBanner={settings?.emergency_banner ?? null}
        />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
