"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/#library", label: "Thư viện", kanji: "壱", match: (path: string) => path === "/" },
  { href: "/#konorano", label: "KonoRano", kanji: "弐", match: () => false },
  { href: "/resources", label: "Tài nguyên", kanji: "参", match: (path: string) => path.startsWith("/resources") },
  { href: "/aozora", label: "Aozora", kanji: "四", match: (path: string) => path.startsWith("/aozora") },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || open || pathname !== "/" ? "border-b border-sumi/12 bg-paper/85 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-[100rem] items-center justify-between px-5 sm:px-8 lg:h-16 lg:px-14">
          <Link href="/" onClick={() => setOpen(false)} className="group flex items-center gap-2.5" aria-label="Ranobe Hub — trang chủ">
            <Image src="/header-icon.png" alt="" width={64} height={58} priority className="h-8 w-auto transition-transform duration-700 group-hover:-rotate-6" />
            <span className="font-display text-[1.35rem] leading-none tracking-[-0.03em] text-sumi">
              <span className="font-light italic">Ranobe</span> <span className="font-semibold">Hub</span>
            </span>
          </Link>

          <nav aria-label="Điều hướng chính" className="hidden items-center gap-9 md:flex">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`link-sweep text-[13px] transition-colors ${active ? "font-medium text-sumi" : "text-sumi-soft hover:text-sumi"}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={SITE.blog}
              target="_blank"
              rel="noopener"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-sumi/25 pl-4 pr-3 text-[13px] text-sumi transition-colors hover:border-sumi hover:bg-sumi hover:text-paper"
            >
              Blog
              <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            className="relative -mr-2 grid size-10 place-items-center md:hidden"
          >
            <span className={`absolute h-px w-6 bg-sumi transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
            <span className={`absolute h-px w-6 bg-sumi transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col bg-paper px-5 pb-8 pt-24 sm:px-8 md:hidden"
          >
            <nav aria-label="Menu di động" className="flex flex-col">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.06 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between border-b border-sumi/15 py-5 font-display text-[2.6rem] leading-none tracking-[-0.03em] text-sumi"
                  >
                    {item.label}
                    <span lang="ja" className="font-mincho text-base font-bold text-shu">
                      {item.kanji}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto flex items-center justify-between font-label text-[11px] uppercase tracking-[0.24em] text-sumi-soft">
              <a href={SITE.blog} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5">
                Blog Ranobe.vn <ArrowUpRight className="size-3.5" />
              </a>
              <a href={SITE.facebook} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5">
                Facebook <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
