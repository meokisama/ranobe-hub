"use client";

import { memo, useRef } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Ebook } from "@/lib/types";
import { coverUrl, readerUrl } from "@/lib/site";
import { trackRead } from "@/lib/track";

interface BookCardProps {
  book: Ebook;
  /** Accession number: position in the order books were added. */
  number: number;
  /** Stagger slot within its batch. */
  slot: number;
  onOpen: (id: string) => void;
}

export const BookCard = memo(function BookCard({ book, number, slot, onOpen }: BookCardProps) {
  const tilt = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = tilt.current;
    if (!el || event.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 9}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 13}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };

  const onPointerLeave = () => {
    const el = tilt.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <li className="book-card group" style={{ "--slot": slot } as React.CSSProperties}>
      <div ref={tilt} className="tilt" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
        <div className="tilt-inner relative aspect-[112/159] rounded-[3px] bg-paper-deep">
          <button
            type="button"
            onClick={() => onOpen(book._id)}
            aria-label={`Xem chi tiết: ${book.name}`}
            className="absolute inset-0 block cursor-pointer overflow-hidden rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-shu"
          >
            <Image
              src={coverUrl(book.coverImage)}
              alt=""
              fill
              sizes="(min-width: 1536px) 15vw, (min-width: 1280px) 18vw, (min-width: 768px) 23vw, (min-width: 640px) 30vw, 45vw"
              className="object-cover"
              loading="lazy"
            />
            <span aria-hidden className="book-hinge absolute inset-0" />
            <span aria-hidden className="tilt-glare absolute inset-0" />
          </button>

          <a
            href={readerUrl(book.filePath)}
            target="_blank"
            rel="noopener"
            onClick={() => trackRead(book._id, book.name, "ebook", "jp_reader")}
            className="quick-read absolute bottom-2.5 left-2.5 inline-flex h-9 items-center gap-1 rounded-full bg-paper/95 pl-3.5 pr-2.5 text-xs font-medium text-sumi shadow-[0_6px_18px_-6px_rgba(23,19,15,0.6)] backdrop-blur transition-all duration-300 hover:bg-shu hover:text-paper"
          >
            <span lang="ja" className="font-mincho font-bold">
              読む
            </span>
            <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
          </a>
        </div>
      </div>

      <div className="mt-4 lg:mt-5">
        <p className="flex items-center justify-between gap-2 font-label text-[9.5px] uppercase tracking-[0.2em] text-sumi-mute">
          <span className="truncate">{book.publisher?.name}</span>
          <span className="shrink-0 tabular-nums">№ {String(number).padStart(3, "0")}</span>
        </p>
        <h3 lang="ja" className="mt-2 line-clamp-2 font-mincho text-[14.5px] font-bold leading-[1.6] text-sumi transition-colors duration-300 group-hover:text-shu lg:text-[15.5px]">
          {book.name}
        </h3>
        <p lang="ja" className="mt-1.5 truncate text-xs font-light text-sumi-soft">
          {book.author}
          {book.illustrator && book.illustrator !== "Unknown" && (
            <>
              <span className="mx-1.5 text-sumi-mute">/</span>
              {book.illustrator}
            </>
          )}
        </p>
      </div>
    </li>
  );
});
