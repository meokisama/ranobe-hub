"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Library, BookMarked, LogOut, Sparkles, X } from "lucide-react";
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
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">Ranobe Reader</span>
              <span className="text-xs text-muted-foreground">Admin Console</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onClose}>
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
                  "group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("mt-0.5 h-4 w-4 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")}
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
          <Button variant="outline" size="lg" className="w-full justify-center gap-2 flex" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>
    </>
  );
}
