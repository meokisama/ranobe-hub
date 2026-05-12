"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, House, Library } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Trang Chủ", icon: House },
  { href: "/resources", label: "Tài Nguyên", icon: Library },
];

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-orange-100/70 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 via-amber-500 to-rose-500 text-white shadow-md shadow-orange-200/60 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
            <BookOpen className="size-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Ranobe Reader</span>
            <span className="text-xs text-muted-foreground">Light Novel Hub</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                  active ? "bg-orange-700 text-orange-50 shadow-md shadow-orange-800/30" : "text-gray-600 hover:bg-orange-50 hover:text-orange-700",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
