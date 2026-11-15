"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, LogOut, X } from "lucide-react";
import { clearAdminToken } from "@/lib/auth-cookies";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/admin", kanji: "壱", label: "Ebooks", description: "Thư viện ebook" },
  { href: "/admin/konorano", kanji: "弐", label: "Konorano", description: "Bảng xếp hạng thường niên" },
  { href: "/admin/hako", kanji: "参", label: "Hako", description: "Kho lưu trữ light novel" },
];

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAdminToken();
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn("fixed inset-0 z-40 bg-sumi/60 transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
            <Image src="/header-icon.png" alt="" width={64} height={58} priority className="h-8 w-auto" />
            <span className="font-display text-[1.3rem] leading-none tracking-[-0.03em]">
              <span className="font-light italic">Ranobe</span> <span className="font-semibold">Hub</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Đóng menu"
            className="grid size-8 cursor-pointer place-items-center rounded-md hover:bg-sidebar-accent lg:hidden"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p className="px-3 pb-3 font-label text-[10px] uppercase tracking-[0.26em] text-muted-foreground">Quản trị nội dung</p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                      active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent",
                    )}
                  >
                    <span
                      lang="ja"
                      className={cn(
                        "grid size-7 shrink-0 place-items-center font-mincho text-sm font-bold",
                        active ? "bg-shu text-paper" : "border border-foreground/20 text-muted-foreground",
                      )}
                    >
                      {item.kanji}
                    </span>
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className={cn("truncate text-[11px]", active ? "text-sidebar-primary-foreground/65" : "text-muted-foreground")}>
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="space-y-1 border-t p-3 text-sm">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            Xem trang công khai
            <ArrowUpRight className="size-4" strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-destructive"
          >
            Đăng xuất
            <LogOut className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </aside>
    </>
  );
}
