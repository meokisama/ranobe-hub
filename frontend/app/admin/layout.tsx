"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminShellProvider } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen lg:flex">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-rose-50/70 via-background to-indigo-50/40 dark:from-rose-950/20 dark:via-background dark:to-indigo-950/20"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 right-0 -z-10 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/3 -left-32 -z-10 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-500/10"
      />

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col lg:min-w-0">
        <AdminShellProvider openSidebar={openSidebar}>
          <main className="flex-1">{children}</main>
        </AdminShellProvider>
      </div>
    </div>
  );
}
