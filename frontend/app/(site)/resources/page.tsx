import type { Metadata } from "next";
import { HakoArchive } from "@/components/resources/hako-archive";
import { SectionHeading } from "@/components/site/section-heading";
import { fetchList } from "@/lib/server-fetch";
import type { Hako } from "@/lib/types";

const title = "Tài nguyên — Kho lưu trữ Hako";
const description = "Tổng hợp tài nguyên Light Novel miễn phí: EPUB và PDF của các bộ truyện cộng đồng đăng tải trên CLN Hako.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default async function ResourcesPage() {
  const items = await fetchList<Hako>("/hakos?limit=5000", "hakos", "hakos");

  let withEpub = 0;
  let withPdf = 0;
  for (const h of items) {
    if (h.epub) withEpub++;
    if (h.pdf) withPdf++;
  }

  const stats = [
    { kanji: "総", label: "Tổng tựa", value: items.length },
    { kanji: "電", label: "Có EPUB", value: withEpub, accent: true },
    { kanji: "紙", label: "Có PDF", value: withPdf },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-sumi pb-14 pt-32 text-paper lg:pb-20 lg:pt-48">
        <span
          aria-hidden
          lang="ja"
          className="text-outline pointer-events-none absolute -right-[4vw] -top-[0.08em] select-none font-mincho text-[62vw] font-extrabold leading-none text-paper/[0.08] lg:text-[36vw]"
        >
          箱
        </span>

        <div className="relative mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-14">
          <SectionHeading
            dark
            as="h1"
            mark="箱"
            label="Light Novel Archive"
            title={
              <>
                Hako<span className="text-shu">.</span> <em className="font-light italic">lưu trữ</em>
              </>
            }
          >
            Kho lưu trữ dự phòng cho light novel được cộng đồng đăng tải trên CLN Hako. EPUB render bởi{" "}
            <a
              href="https://www.facebook.com/mango.tttq"
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal text-paper underline decoration-shu decoration-1 underline-offset-4 hover:text-shu"
            >
              Mango-chan
            </a>
            , PDF đang cân nhắc convert.
          </SectionHeading>

          <dl className="mt-10 grid grid-cols-3 gap-x-5 lg:mt-14 lg:max-w-3xl lg:gap-x-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.22em] text-paper/50">
                  <span lang="ja" className="font-mincho text-sm font-bold tracking-normal text-shu">
                    {stat.kanji}
                  </span>
                  {stat.label}
                </dt>
                <dd className={`mt-2 font-display text-[2.6rem] font-light leading-none tracking-[-0.03em] tabular-nums sm:text-6xl lg:text-7xl ${stat.accent ? "italic text-shu" : "text-paper"}`}>
                  {stat.value.toLocaleString("vi-VN")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <HakoArchive items={items} />
    </>
  );
}
