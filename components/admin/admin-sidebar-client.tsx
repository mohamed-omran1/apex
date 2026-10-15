"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminSidebarClient(props: {
  email: string;
  emergencyMode: boolean;
  emergencyBanner: string | null;
}) {
  const pathname = usePathname();
  return <AdminSidebar {...props} pathname={pathname} />;
}
