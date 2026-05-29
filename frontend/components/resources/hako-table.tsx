import { Hako } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HakoTableInteractive } from "./hako-table-interactive";

interface Stats {
  total: number;
  withEpub: number;
  withPdf: number;
}

async function getHakos(): Promise<Hako[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${base}/api/hakos?limit=5000`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.hakos ?? [];
  } catch (err) {
    console.error("Lỗi khi tải danh sách hako:", err);
    return [];
  }
}

function computeStats(items: Hako[]): Stats {
  let withEpub = 0;
  let withPdf = 0;
  for (const h of items) {
    if (h.epub) withEpub++;
    if (h.pdf) withPdf++;
  }
  return { total: items.length, withEpub, withPdf };
}

export async function HakoTable() {
  const items = await getHakos();
  const stats = computeStats(items);

  return (
    <div className="relative">
      {/* === HERO (dark editorial band) === */}
      <section className="relative overflow-hidden bg-[#15110d] text-stone-100">
        {/* Texture / grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.08) 2px 3px), repeating-linear-gradient(90deg, transparent 0 2px, rgba(255,255,255,0.05) 2px 3px)",
          }}
        />
        {/* Glow accents */}
        <div className="pointer-events-none absolute -left-32 top-1/2 size-[28rem] -translate-y-1/2 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 size-[24rem] rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-screen-xl px-4 py-16 md:px-6 md:py-24">
          {/* Editorial slug */}
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-stone-400">
            <span className="block h-px w-10 bg-orange-400/80" />
            <span>Light Novel Archive</span>
            <span className="text-stone-600">/</span>
            <span className="text-stone-500">Collection 1</span>
          </div>

          {/* Main title */}
          <h1 className="mt-6 font-playfair_display text-7xl font-black italic leading-none tracking-tight md:text-[8rem] lg:text-[10rem]">
            <span className="bg-gradient-to-br from-orange-200 via-amber-100 to-rose-200 bg-clip-text text-transparent">
              Hako<span className="text-orange-500">.</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base text-stone-300 md:text-lg">
            Kho lưu trữ dự phòng cho light novel được cộng đồng đăng tải trên CLN Hako, EPUB render bởi{" "}
            <a
              href="https://www.facebook.com/mango.tttq"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-orange-200 underline decoration-orange-400/50 decoration-2 underline-offset-4 transition hover:text-orange-100 hover:decoration-orange-300"
            >
              Mango-chan
            </a>
            , PDF đang cân nhắc convert.
          </p>

          {/* Stats strip */}
          <div className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-stone-700/40 ring-1 ring-stone-700/40 md:max-w-2xl">
            <StatCell label="Tổng tựa" value={stats.total} />
            <StatCell label="Có EPUB" value={stats.withEpub} accent />
            <StatCell label="Có PDF" value={stats.withPdf} />
          </div>
        </div>

        {/* Hairline bottom */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />
      </section>

      <HakoTableInteractive initialItems={items} />
    </div>
  );
}

function StatCell({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 bg-[#15110d] px-5 py-5">
      <div className="text-[10px] uppercase tracking-[0.25em] text-stone-500">{label}</div>
      <div
        className={cn(
          "font-playfair_display text-3xl font-bold tabular-nums leading-tight md:text-4xl",
          accent ? "text-orange-300" : "text-stone-100",
        )}
      >
        {value.toLocaleString("vi-VN")}
      </div>
    </div>
  );
}
