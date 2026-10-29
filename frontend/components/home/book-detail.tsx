"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import type { Ebook } from "@/lib/types";
import { coverUrl, formatDotDate, readerUrl } from "@/lib/site";
import { trackRead } from "@/lib/track";

const EASE = [0.16, 1, 0.3, 1] as const;

interface BookDetailProps {
  book: Ebook;
  /** 1-based position within the list it was opened from. */
  position: number;
  total: number;
  onClose: () => void;
  onStep: (direction: 1 | -1) => void;
}

export function BookDetail({ book, position, total, onClose, onStep }: BookDetailProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onClose, onStep });

  useEffect(() => {
    handlers.current = { onClose, onStep };
  }, [onClose, onStep]);

  // Modal behaviour: lock scroll, take focus, hand it back on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handlers.current.onClose();
      else if (event.key === "ArrowRight") handlers.current.onStep(1);
      else if (event.key === "ArrowLeft") handlers.current.onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = bookRef.current;
    if (!el || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--by", `${px * 56}deg`);
    el.style.setProperty("--bx", `${py * -18}deg`);
  };

  const onPointerLeave = () => {
    const el = bookRef.current;
    if (!el) return;
    el.style.removeProperty("--by");
    el.style.removeProperty("--bx");
  };

  const hasIllustrator = book.illustrator && book.illustrator !== "Unknown";

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6 lg:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-sumi/75 backdrop-blur-[6px]" onClick={onClose} aria-hidden />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={book.name}
        initial={{ y: 48, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 28, opacity: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative grid max-h-[94svh] w-full max-w-[68rem] overflow-y-auto rounded-t-[1.25rem] bg-paper shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)] sm:rounded-[4px] md:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] md:overflow-hidden"
      >
        {/* Stage */}
        <div
          className="detail-stage relative flex min-h-[19rem] items-center justify-center overflow-hidden px-8 py-10 md:min-h-[36rem] md:py-14"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <span
            aria-hidden
            lang="ja"
            className="text-outline pointer-events-none absolute -bottom-[0.18em] -left-[0.06em] select-none font-mincho text-[15rem] font-extrabold leading-none text-sumi/[0.12] md:text-[21rem]"
          >
            本
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={book._id}
              className="book3d-scene"
              initial={{ opacity: 0, y: 26, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.97 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div ref={bookRef} className="book3d">
                <div className="book3d-front">
                  <Image src={coverUrl(book.coverImage)} alt={`Bìa sách ${book.name}`} fill sizes="(min-width: 768px) 320px, 180px" className="object-cover" priority />
                  <span aria-hidden className="book-hinge absolute inset-0" />
                </div>
                <div className="book3d-back" />
                <div className="book3d-spine">
                  <span lang="ja" className="tategaki max-h-[92%] overflow-hidden whitespace-nowrap font-mincho text-[10px] font-bold tracking-[0.08em] text-paper/90 md:text-xs">
                    {book.name}
                  </span>
                </div>
                <div className="book3d-pages" />
                <div className="book3d-shadow" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Colophon */}
        <div className="relative flex flex-col px-6 pb-7 pt-6 sm:px-9 md:px-11 md:pb-10 md:pt-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={book._id}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="flex flex-1 flex-col"
            >
              <p className="flex items-center gap-3 pr-12 font-label text-[10.5px] uppercase tracking-[0.26em] text-sumi-soft">
                <span className="size-1.5 rounded-full bg-shu" />
                {book.publisher?.name}
              </p>

              <h2 lang="ja" className="mt-5 font-mincho text-[1.55rem] font-extrabold leading-[1.5] text-sumi md:text-[2rem] md:leading-[1.45]">
                {book.name}
              </h2>

              <dl className="mt-8 grid grid-cols-[6.75rem_minmax(0,1fr)] gap-x-5 border-t border-sumi/15 text-sm md:mt-10">
                <Row kanji="著" label="Tác giả" value={book.author} ja />
                {hasIllustrator && <Row kanji="絵" label="Minh họa" value={book.illustrator} ja />}
                <Row kanji="刊" label="Phát hành" value={formatDotDate(book.releaseDate)} />
                <Row kanji="棚" label="Lên kệ" value={formatDotDate(book.createdAt)} />
              </dl>

              <div className="mt-auto pt-9">
                <a
                  href={readerUrl(book.filePath)}
                  target="_blank"
                  rel="noopener"
                  onClick={() => trackRead(book._id, book.name, "ebook", "jp_reader")}
                  className="group flex h-16 items-center justify-between rounded-full bg-sumi pl-8 pr-3 text-paper transition-colors duration-300 hover:bg-shu"
                >
                  <span className="flex items-baseline gap-3">
                    <span lang="ja" className="font-mincho text-xl font-bold">
                      読む
                    </span>
                    <span className="text-sm font-light text-paper/75">Đọc ngay</span>
                  </span>
                  <span className="grid size-10 place-items-center rounded-full bg-paper text-sumi transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="size-5" strokeWidth={1.5} />
                  </span>
                </a>
                <p className="mt-3 text-center text-xs font-light text-sumi-mute">Mở bằng trình đọc Aozora trong thẻ mới</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {total > 1 && (
            <div className="mt-7 flex items-center justify-between border-t border-sumi/15 pt-4 font-label text-[10.5px] uppercase tracking-[0.22em] text-sumi-mute">
              <button type="button" onClick={() => onStep(-1)} className="inline-flex items-center gap-2 py-1 text-sumi-soft transition-colors hover:text-shu">
                <ArrowLeft className="size-3.5" strokeWidth={1.5} />
                Trước
              </button>
              <span className="tabular-nums">
                <span className="text-sumi">{String(position).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
              </span>
              <button type="button" onClick={() => onStep(1)} className="inline-flex items-center gap-2 py-1 text-sumi-soft transition-colors hover:text-shu">
                Sau
                <ArrowRight className="size-3.5" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-3.5 top-3.5 z-10 grid size-10 place-items-center rounded-full bg-paper/80 text-sumi backdrop-blur transition-colors hover:bg-sumi hover:text-paper md:right-5 md:top-5"
        >
          <X className="size-4.5" strokeWidth={1.5} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function Row({ kanji, label, value, ja }: { kanji: string; label: string; value: string; ja?: boolean }) {
  return (
    <div className="col-span-2 grid grid-cols-subgrid items-baseline border-b border-sumi/15 py-3">
      <dt className="flex items-baseline gap-2 font-label text-[10px] uppercase tracking-[0.16em] text-sumi-mute">
        <span lang="ja" className="font-mincho text-sm font-bold tracking-normal text-shu">
          {kanji}
        </span>
        {label}
      </dt>
      <dd lang={ja ? "ja" : undefined} className={ja ? "font-mincho text-[15px] font-medium text-sumi" : "font-label text-[13px] tabular-nums text-sumi"}>
        {value}
      </dd>
    </div>
  );
}
