import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";

const BROWSE = [
  { href: "/#library", label: "Thư viện" },
  { href: "/#konorano", label: "KonoRano" },
  { href: "/resources", label: "Tài nguyên Hako" },
  { href: "/aozora", label: "Trình đọc Aozora" },
];

const ELSEWHERE = [
  { href: SITE.blog, label: "Blog Ranobe.vn" },
  { href: SITE.facebook, label: "Facebook" },
  { href: SITE.aozoraRepo, label: "Aozora trên GitHub" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-sumi text-paper">
      <div className="mx-auto max-w-[100rem] px-5 pt-20 sm:px-8 lg:px-14 lg:pt-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6">
            <p lang="ja" className="font-mincho text-lg font-bold tracking-[0.3em] text-shu">
              読書の時間
            </p>
            <p className="mt-5 max-w-md font-display text-3xl font-light leading-[1.15] tracking-[-0.02em] lg:text-[2.6rem]">
              Một kệ sách nhỏ, mở cửa cho bất kỳ ai <em className="italic">muốn đọc</em>.
            </p>
            <a href={`mailto:${SITE.email}`} className="link-sweep mt-8 inline-block font-label text-sm text-paper/80">
              {SITE.email}
            </a>
          </div>

          <nav aria-label="Duyệt" className="md:col-span-3">
            <p className="font-label text-[10px] uppercase tracking-[0.28em] text-paper/45">Duyệt</p>
            <ul className="mt-5 space-y-3 text-[15px] font-light">
              {BROWSE.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-sweep text-paper/85 hover:text-paper">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Liên kết ngoài" className="md:col-span-3">
            <p className="font-label text-[10px] uppercase tracking-[0.28em] text-paper/45">Nơi khác</p>
            <ul className="mt-5 space-y-3 text-[15px] font-light">
              {ELSEWHERE.map((item) => (
                <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noopener" className="link-sweep inline-flex items-center gap-1.5 text-paper/85 hover:text-paper">
                    {item.label}
                    <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-paper/15 pt-5 font-label text-[10px] uppercase tracking-[0.24em] text-paper/45 lg:mt-24">
          <span>© {new Date().getFullYear()} Meoki</span>
          <span lang="ja" className="font-mincho text-xs normal-case tracking-[0.3em]">
            ライトノベル書庫
          </span>
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none -mb-[0.09em] mt-8 select-none whitespace-nowrap text-center font-display text-[21vw] leading-none tracking-[-0.05em] text-paper"
      >
        <span className="font-light italic">Ranobe</span> <span className="font-semibold">Hub</span>
        <span className="text-shu">.</span>
      </p>
    </footer>
  );
}
