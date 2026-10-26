"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Ebook } from "@/lib/types";
import { coverTextureUrl, coverUrl, formatDotDate, kanjiNumber } from "@/lib/site";
import type { StageBook, StageControls } from "./hero-stage";

const HeroStage = dynamic(() => import("./hero-stage"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

const lineUp: Variants = {
  hidden: { y: "108%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 1.1, ease: EASE, delay: 0.15 + i * 0.09 } }),
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: 0.5 + i * 0.08 } }),
};

// Resting poses for the static fan shown before (or instead of) the WebGL ring.
const FAN = [
  { x: -118, r: -13, y: 22, z: 1 },
  { x: -60, r: -6.5, y: 6, z: 2 },
  { x: 0, r: 0, y: 0, z: 3 },
  { x: 60, r: 6.5, y: 6, z: 2 },
  { x: 118, r: 13, y: 22, z: 1 },
];

interface HeroProps {
  /** Newest arrivals, newest first. Shown on the ring. */
  books: Ebook[];
  total: number;
  publisherCount: number;
  onOpen: (index: number) => void;
}

export function Hero({ books, total, publisherCount, onOpen }: HeroProps) {
  const controls = useRef<StageControls | null>(null);
  const [front, setFront] = useState(0);
  const [ready, setReady] = useState(false);

  const stageBooks = useMemo<StageBook[]>(() => books.map((b) => ({ id: b._id, texture: coverTextureUrl(b.coverImage) })), [books]);
  const handleReady = useCallback(() => setReady(true), []);

  const current = books[Math.min(front, books.length - 1)];
  const latest = books[0]?.createdAt;

  return (
    <section className="relative isolate flex min-h-[max(100svh,44rem)] flex-col overflow-hidden bg-paper">
      {/* Static fan: first paint, and the whole show when WebGL is unavailable. */}
      {books.length > 0 && (
        <div
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-[70%] z-[1] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 lg:left-[72%] lg:top-1/2 ${
            ready ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="relative h-[13.5rem] w-[9.5rem] lg:h-[21rem] lg:w-[14.75rem]">
            {FAN.slice(0, Math.min(FAN.length, books.length)).map((pose, i) => (
              <div
                key={books[i]!._id}
                className="absolute inset-0 overflow-hidden rounded-[3px] bg-paper-deep shadow-[0_30px_60px_-28px_rgba(23,19,15,0.55)]"
                style={{
                  transform: `translate(${pose.x}%, ${pose.y}px) rotate(${pose.r}deg) scale(${pose.z === 3 ? 1 : pose.z === 2 ? 0.92 : 0.84})`,
                  zIndex: pose.z,
                }}
              >
                <Image src={coverUrl(books[i]!.coverImage)} alt="" fill sizes="240px" className="object-cover" priority={pose.z === 3} />
              </div>
            ))}
          </div>
        </div>
      )}

      {stageBooks.length > 0 && <HeroStage books={stageBooks} controlsRef={controls} onFront={setFront} onSelect={onOpen} onReady={handleReady} />}

      {/* Paper rises back up to meet the page below. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-t from-paper to-transparent" />

      {/* Copy */}
      <div className="pointer-events-none relative z-[3] mx-auto flex w-full max-w-[100rem] flex-1 flex-col px-5 pt-28 sm:px-8 lg:px-14 lg:pt-36">
        <motion.div initial="hidden" animate="show" className="max-w-[46rem]">
          <motion.p
            variants={fadeUp}
            custom={-3}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 font-label text-[11px] uppercase tracking-[0.28em] text-sumi-soft"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-shu opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-shu" />
            </span>
            <span className="font-mincho text-[13px] tracking-[0.2em] text-sumi">蔵書 {kanjiNumber(total)} 冊</span>
            <span className="h-px w-8 bg-sumi/30" />
            <span>Cập nhật {formatDotDate(latest)}</span>
          </motion.p>

          <h1 className="mt-6 font-display text-[clamp(4.6rem,13.2vw,13.5rem)] leading-[0.8] tracking-[-0.045em] text-sumi mix-blend-multiply lg:mt-8">
            <span className="block overflow-hidden pb-[0.08em] pt-[0.06em]">
              <motion.span variants={lineUp} custom={0} className="block font-light italic">
                Ranobe
              </motion.span>
            </span>
            <span className="-mt-[0.06em] block overflow-hidden pb-[0.14em]">
              <motion.span variants={lineUp} custom={1} className="block pl-[0.62em] font-semibold">
                Hub<span className="text-shu">.</span>
              </motion.span>
            </span>
          </h1>

          <motion.p variants={fadeUp} custom={1} className="mt-6 max-w-[31rem] text-[15px] font-light leading-[1.75] text-sumi-soft sm:text-base lg:mt-9">
            Kệ sách nhỏ nơi mình lưu trữ và chia sẻ light novel tiếng Nhật. Chọn một cuốn, mở ra và đọc ngay trên trình duyệt cùng{" "}
            <Link href="/aozora" className="pointer-events-auto font-normal text-sumi underline decoration-shu/60 decoration-1 underline-offset-4 hover:decoration-shu">
              Aozora
            </Link>
            .
          </motion.p>

          <motion.div variants={fadeUp} custom={2} className="pointer-events-auto mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a
              href="#library"
              className="group inline-flex h-13 items-center gap-3 rounded-full bg-sumi pl-7 pr-2.5 text-sm font-medium text-paper transition-colors duration-300 hover:bg-shu"
            >
              Vào thư viện
              <span className="grid size-8 place-items-center rounded-full bg-paper text-sumi transition-transform duration-500 group-hover:translate-y-0.5">
                <ArrowDown className="size-4" strokeWidth={1.75} />
              </span>
            </a>
            <Link href="/resources" className="link-sweep inline-flex items-center gap-1.5 text-sm font-medium text-sumi">
              Kho tài nguyên Hako
              <ArrowUpRight className="size-4" strokeWidth={1.75} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom rail */}
        <div className="mt-auto flex items-end justify-between gap-6 pb-7 pt-[19rem] lg:pb-10 lg:pt-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.3 }}
            className="hidden items-center gap-4 font-label text-[10px] uppercase tracking-[0.3em] text-sumi-mute lg:flex"
          >
            <span className="scroll-cue relative block h-14 w-px overflow-hidden bg-sumi/15" />
            <span>
              {publisherCount} nhà xuất bản
              <br />
              {total} đầu sách
            </span>
          </motion.div>

          {current && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 1.1 }}
              className="pointer-events-auto w-full border-t border-sumi/80 pt-4 lg:w-[27rem]"
            >
              <div className="flex items-center justify-between font-label text-[10px] uppercase tracking-[0.28em] text-sumi-mute">
                <span>
                  <span className="mr-2 font-mincho text-xs tracking-[0.2em] text-shu">新着</span>
                  Mới lên kệ
                </span>
                <span className="tabular-nums text-sumi">
                  {String(front + 1).padStart(2, "0")}
                  <span className="mx-1.5 text-sumi-mute">/</span>
                  {String(books.length).padStart(2, "0")}
                </span>
              </div>

              <div className="mt-3 flex items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={current._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    >
                      <p lang="ja" className="line-clamp-2 min-h-[3.1em] font-mincho text-[17px] font-bold leading-[1.55] text-sumi">
                        {current.name}
                      </p>
                      <p lang="ja" className="mt-1 truncate text-xs text-sumi-soft">
                        {current.author}
                        <span className="mx-2 text-sumi-mute">/</span>
                        {current.publisher?.name}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {ready && books.length > 1 && (
                    <>
                      <button type="button" aria-label="Cuốn trước" onClick={() => controls.current?.step(-1)} className="round-btn">
                        <ArrowLeft className="size-4" strokeWidth={1.5} />
                      </button>
                      <button type="button" aria-label="Cuốn sau" onClick={() => controls.current?.step(1)} className="round-btn">
                        <ArrowRight className="size-4" strokeWidth={1.5} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpen(Math.min(front, books.length - 1))}
                    className="ml-1 inline-flex h-10 items-center rounded-full bg-shu px-5 text-[13px] font-medium text-paper transition-colors hover:bg-sumi"
                  >
                    Mở sách
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tategaki margin note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 1.2 }}
        lang="ja"
        className="tategaki pointer-events-none absolute right-4 top-28 z-[3] hidden font-mincho text-[13px] tracking-[0.5em] text-sumi/55 sm:block lg:right-7 lg:top-36"
      >
        無料で共有されている電子書籍
      </motion.p>
    </section>
  );
}
