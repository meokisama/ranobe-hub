"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Library, BookMarked, LogOut, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  {
    href: "/admin",
    label: "Ebooks",
    description: "Quản lý thư viện ebook",
    icon: Library,
  },
  {
    href: "/admin/konorano",
    label: "Konorano",
    description: "Bảng xếp hạng thường niên",
    icon: BookMarked,
  },
];

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    document.cookie = "adminTokenExpires=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card text-card-foreground shadow-lg transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="relative flex h-16 items-center justify-between overflow-hidden border-b px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-violet-50/60 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-violet-950/30"
          />
          <Link href="/admin" className="group relative flex items-center gap-2.5" onClick={onClose}>
            <div className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 via-pink-500 to-violet-500 text-white shadow-md shadow-rose-200/60 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105 dark:shadow-rose-500/20">
              <BookOpen className="size-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">Ranobe Hub</span>
              <span className="text-xs text-muted-foreground">Admin Console</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="relative h-8 w-8 lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nội dung</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-rose-50/70 hover:text-foreground dark:hover:bg-rose-950/30",
                )}
              >
                <Icon
                  className={cn(
                    "size-4.5 shrink-0 transition-transform group-hover:scale-110",
                    active
                      ? "text-primary-foreground"
                      : "text-rose-400 group-hover:text-rose-500 dark:text-rose-300/70 dark:group-hover:text-rose-300",
                  )}
                />
                <div className="flex flex-col leading-tight">
                  <span className="font-medium">{item.label}</span>
                  <span className={cn("text-[11px]", active ? "text-primary-foreground/70" : "text-muted-foreground/70")}>{item.description}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <Button
            variant="outline"
            size="lg"
            className="flex w-full justify-center gap-2 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>
    </>
  );
}
