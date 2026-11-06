"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { MotionConfig, motion, type Variants } from "motion/react";
import { ArrowLeft, ArrowUpRight, Download, Globe } from "lucide-react";
import { AOZORA_WEB_URL, SITE } from "@/lib/site";

const SkyCanvas = dynamic(() => import("./sky-canvas"), { ssr: false });

const FEATURES = [
  { kanji: "辞", name: "Từ điển Yomitan", note: "Tra từ ngay khi đọc" },
  { kanji: "札", name: "Flashcard Anki", note: "Tạo thẻ học từ vựng" },
  { kanji: "声", name: "Giọng waifu (TTS)", note: "Nghe tiểu thuyết đọc thành tiếng" },
  { kanji: "縦", name: "Tategaki", note: "Chữ dọc như sách in" },
  { kanji: "計", name: "Thống kê đọc", note: "Theo dõi quá trình đọc" },
  { kanji: "遊", name: "Discord RP", note: "Hiển thị sách đang đọc" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

const stagger: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.2, staggerChildren: 0.11 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
};

const logoIn: Variants = {
  hidden: { opacity: 0, y: -30, scale: 0.86 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.2, ease: EASE } },
};

export function AozoraLanding() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative isolate flex min-h-svh w-full flex-col overflow-hidden font-body text-[#12325f]">
        {/* Sky: CSS gradient first, the shader fades in over it. */}
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(to bottom, #4a8cec 0%, #99ccfb 48%, #e6f3ff 100%)" }}>
          <SkyCanvas />
        </div>

        {/* Giant watermark */}
        <motion.span
          aria-hidden
          lang="ja"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: EASE }}
          className="pointer-events-none absolute left-1/2 top-[46%] -z-10 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-mincho text-[44vw] font-extrabold leading-none text-white/25 mix-blend-soft-light lg:text-[30vw]"
        >
          青空
        </motion.span>

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-5 sm:px-8 lg:px-14 lg:pt-8">
          <Link href="/" className="group inline-flex h-10 items-center gap-2 rounded-full bg-white/55 pl-3 pr-4 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white">
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={1.75} />
            Ranobe Hub
          </Link>
          <a
            href={SITE.aozoraRepo}
            target="_blank"
            rel="noopener"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/55 pl-4 pr-3 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white"
          >
            GitHub
            <ArrowUpRight className="size-4" strokeWidth={1.75} />
          </a>
        </div>

        {/* Tategaki tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 1.1 }}
          lang="ja"
          className="tategaki pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 font-mincho text-base font-medium tracking-[0.5em] text-[#12325f]/70 md:block lg:right-14"
        >
          青空の下で、物語が始まる。
        </motion.p>

        <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 py-8 text-center sm:px-8">
          <motion.div variants={logoIn}>
            <Image
              src="/aozora/aozora-logo.png"
              alt="Aozora"
              width={808}
              height={603}
              priority
              className="h-auto w-[190px] select-none drop-shadow-[0_18px_40px_rgba(18,50,95,0.28)] sm:w-[230px]"
            />
          </motion.div>

          <motion.h1 variants={rise} className="mt-7 max-w-3xl font-display text-[clamp(2.2rem,4.6vw,3.9rem)] font-light leading-[1.02] tracking-[-0.035em]">
            Trình đọc EPUB cho người <em className="whitespace-nowrap font-normal italic">học tiếng Nhật</em>.
          </motion.h1>

          <motion.p variants={rise} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#12325f]/85 sm:text-base">
            Đọc light novel &amp; manga với từ điển tiếng Nhật tích hợp, tạo flashcard Anki, nghe tiểu thuyết bằng giọng waifu và nhiều tính năng khác.
          </motion.p>

          <motion.div variants={rise} className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
            <a
              href={AOZORA_WEB_URL}
              target="_blank"
              rel="noopener"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#12325f] pl-7 pr-2.5 text-sm font-medium text-white shadow-[0_18px_40px_-16px_rgba(18,50,95,0.8)] transition-colors duration-300 hover:bg-[#0b2145]"
            >
              Đọc trên Web
              <span className="grid size-9 place-items-center rounded-full bg-white text-[#12325f] transition-transform duration-700 group-hover:rotate-[20deg]">
                <Globe className="size-4" strokeWidth={1.75} />
              </span>
            </a>
            <a
              href={SITE.aozoraReleases}
              target="_blank"
              rel="noopener"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-white/70 pl-7 pr-2.5 text-sm font-medium backdrop-blur-md transition-colors duration-300 hover:bg-white"
            >
              Tải bản Desktop
              <span className="grid size-9 place-items-center rounded-full bg-[#12325f] text-white transition-transform duration-500 group-hover:translate-y-0.5">
                <Download className="size-4" strokeWidth={1.75} />
              </span>
            </a>
          </motion.div>

          <motion.ul
            variants={rise}
            className="mt-10 grid w-full grid-cols-2 overflow-hidden rounded-[1.25rem] bg-white/55 text-left shadow-[0_30px_80px_-40px_rgba(18,50,95,0.6)] backdrop-blur-xl md:grid-cols-3"
          >
            {FEATURES.map((feature) => (
              <li key={feature.name} className="flex items-start gap-3.5 border-b border-r border-white/70 p-4 sm:p-5">
                <span lang="ja" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#12325f] font-mincho text-base font-bold text-white">
                  {feature.kanji}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{feature.name}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-[#12325f]/70">{feature.note}</span>
                </span>
              </li>
            ))}
          </motion.ul>

          <motion.p variants={rise} className="mt-7 text-xs text-[#12325f]/70">
            Chi tiết tính năng &amp; mã nguồn trên{" "}
            <a href={SITE.aozoraRepo} target="_blank" rel="noopener" className="font-medium text-[#12325f] underline decoration-1 underline-offset-4">
              GitHub
            </a>
          </motion.p>
        </motion.div>
      </main>
    </MotionConfig>
  );
}
