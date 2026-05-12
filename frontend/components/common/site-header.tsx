"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Library } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Trang Chủ", icon: House },
  { href: "/resources", label: "Tài Nguyên", icon: Library },
];

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-30 w-full bg-background/70 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/2 size-40 -translate-y-1/2 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute -right-20 top-1/2 size-40 -translate-y-1/2 rounded-full bg-rose-300/20 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />

      <div className="relative mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/header-icon.png"
            alt="Ranobe Hub"
            width={45}
            height={40}
            priority
            className="h-10 w-auto transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
          />
          <Image src="/header-text.png" alt="ranobe hub" width={156} height={40} priority className="h-10 w-auto" />
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
                  "group relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white shadow-md shadow-orange-300/50"
                    : "text-gray-600 hover:text-orange-700",
                )}
              >
                {!active && (
                  <span className="pointer-events-none absolute inset-x-3.5 bottom-1 h-0.5 origin-center scale-x-0 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-rose-400 transition-transform duration-300 group-hover:scale-x-100" />
                )}
                <Icon className={cn("size-4 shrink-0 transition-transform duration-300", !active && "group-hover:-rotate-6 group-hover:scale-110")} />
                <span className="hidden sm:inline">{item.label}</span>
                {active && (
                  <span className="ml-0.5 hidden size-1.5 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)] sm:inline-block" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
