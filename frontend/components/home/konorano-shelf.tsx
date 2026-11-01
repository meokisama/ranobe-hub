"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Konorano } from "@/lib/types";
import { coverUrl, formatDotDate, readerUrl } from "@/lib/site";
import { trackRead } from "@/lib/track";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";

/** The edition year printed in the title (このライトノベルがすごい！2025), else the year after release. */
function editionYear(item: Konorano): string {
  const inName = item.name.match(/(?:19|20)\d{2}/)?.[0];
  if (inName) return inName;
  const release = new Date(item.releaseDate);
  return Number.isNaN(release.getTime()) ? "—" : String(release.getUTCFullYear() + 1);
}

export function KonoranoShelf({ items }: { items: Konorano[] }) {
  if (items.length === 0) return null;

  const sorted = items.slice().sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  return (
    <section id="konorano" className="relative scroll-mt-16 overflow-hidden bg-sumi py-24 text-paper lg:py-40">
      <span
        aria-hidden
        lang="ja"
        className="text-outline pointer-events-none absolute -left-[2vw] bottom-[-0.2em] select-none font-mincho text-[42vw] font-extrabold leading-none text-paper/[0.07] lg:text-[26vw]"
      >
        凄い
      </span>

      <div className="relative mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-14">
        <SectionHeading
          dark
          mark="弐"
          label="KonoRano"
          title={
            <>
              Kono Light Novel <em className="whitespace-nowrap font-light italic text-shu">ga Sugoi!</em>
            </>
          }
        >
          <span lang="ja" className="font-mincho font-bold text-paper">
            『このライトノベルがすごい！』
          </span>{" "}
          — cẩm nang xếp hạng light novel thường niên của Takarajimasha. Đọc bản gốc tiếng Nhật, hoặc mở bản dịch tiếng Việt.
        </SectionHeading>

        <ol className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:mt-20 lg:grid lg:grid-cols-3 lg:gap-x-10 lg:gap-y-20 lg:overflow-visible lg:px-0 xl:grid-cols-6 xl:gap-x-7">
          {sorted.map((item, i) => (
            <Reveal as="li" key={item._id} delay={i * 0.06} className="group w-[58vw] max-w-[17rem] shrink-0 snap-start lg:w-auto lg:max-w-none">
              <p className="text-outline -mb-[0.06em] select-none font-display text-[5.25rem] font-light italic leading-none tracking-[-0.04em] text-paper/75 transition-colors duration-500 group-hover:text-shu xl:text-[4.6rem] 2xl:text-[5.6rem]">
                {editionYear(item)}
              </p>

              <a
                href={readerUrl(item.filePath)}
                target="_blank"
                rel="noopener"
                onClick={() => trackRead(item._id, item.name, "konorano", "jp_reader")}
                aria-label={`Đọc bản gốc: ${item.name}`}
                className="relative block aspect-[112/159] overflow-hidden rounded-[3px] bg-paper/10 shadow-[0_30px_50px_-30px_rgba(0,0,0,0.9)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2"
              >
                <Image
                  src={coverUrl(item.coverImage)}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 15vw, (min-width: 1024px) 28vw, 58vw"
                  className="object-cover"
                  loading="lazy"
                />
                <span aria-hidden className="book-hinge absolute inset-0" />
              </a>

              <h3 lang="ja" className="mt-5 font-mincho text-[15px] font-bold leading-[1.6] text-paper">
                {item.name}
              </h3>
              <p className="mt-1 font-label text-[10px] uppercase tracking-[0.2em] text-paper/50">
                <span lang="ja" className="font-mincho normal-case tracking-normal">
                  {item.author}
                </span>
                <span className="mx-2">·</span>
                {formatDotDate(item.releaseDate)}
              </p>

              <div className="mt-4 border-b border-paper/20 text-[13px]">
                <a
                  href={readerUrl(item.filePath)}
                  target="_blank"
                  rel="noopener"
                  onClick={() => trackRead(item._id, item.name, "konorano", "jp_reader")}
                  className="flex items-center justify-between border-t border-paper/20 py-3 transition-colors hover:text-shu"
                >
                  <span>
                    Bản gốc
                    <span className="ml-2 font-label text-[10px] tracking-[0.2em] text-paper/50">JP</span>
                  </span>
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </a>
                {item.viURL && (
                  <a
                    href={item.viURL}
                    target="_blank"
                    rel="noopener"
                    onClick={() => trackRead(item._id, item.name, "konorano", "vi_translation")}
                    className="flex items-center justify-between border-t border-paper/20 py-3 transition-colors hover:text-shu"
                  >
                    <span>
                      Bản dịch
                      <span className="ml-2 font-label text-[10px] tracking-[0.2em] text-paper/50">VN</span>
                    </span>
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
