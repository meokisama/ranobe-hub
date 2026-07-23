"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowLeft, Download, Globe } from "lucide-react";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJp = Noto_Sans_JP({
  weight: "900",
  subsets: ["latin"],
  display: "swap",
});

const WEB_URL = `${process.env.NEXT_PUBLIC_API_URL}/reader`;
const DESKTOP_URL = "https://github.com/meokisama/aozora/releases";
const REPO_URL = "https://github.com/meokisama/aozora";

const features = ["Từ điển Yomitan", "Flashcard Anki", "Giọng waifu (TTS)", "Discord RP", "Tategaki", "Thống kê đọc"];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const container: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.15, staggerChildren: 0.14 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.85, ease } },
};

const logoVariant: Variants = {
  hidden: { opacity: 0, scale: 0.82, y: -36, filter: "blur(14px)" },
  show: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.05, ease } },
};

const pillsWrap: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const pop: Variants = {
  hidden: { opacity: 0, scale: 0.7, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 18 } },
};

// Drifting clouds — negative delays prefill the sky on load
const clouds = [
  { top: "13%", w: "18rem", dur: "62s", delay: "-8s", opacity: 0.5 },
  { top: "30%", w: "25rem", dur: "86s", delay: "-52s", opacity: 0.4 },
  { top: "50%", w: "14rem", dur: "50s", delay: "-24s", opacity: 0.48 },
  { top: "68%", w: "21rem", dur: "72s", delay: "-38s", opacity: 0.35 },
];

function Cloud({ style }: { style: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 96" className="aozora-cloud absolute h-auto" style={{ filter: "blur(16px)", ...style }} aria-hidden="true">
      <g fill="#ffffff">
        <ellipse cx="100" cy="74" rx="94" ry="20" />
        <circle cx="56" cy="58" r="28" />
        <circle cx="100" cy="44" r="40" />
        <circle cx="146" cy="56" r="30" />
      </g>
    </svg>
  );
}

export function AozoraLanding() {
  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden text-slate-800">
      {/* Sky background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #eaf4ff 0%, #d3e9fd 38%, #b8ddfb 66%, #cfe9fc 100%)" }} />

        {/* Sun glow */}
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

        {/* Soft white cloud fields — break up the blue */}
        <div className="absolute -left-24 top-[8%] h-72 w-[34rem] rounded-full bg-white/55 blur-3xl" />
        <div className="absolute -right-28 top-[22%] h-80 w-[38rem] rounded-full bg-white/45 blur-3xl" />
        <div className="absolute left-[12%] top-[46%] h-64 w-[30rem] rounded-full bg-white/40 blur-3xl" />
        <div className="absolute right-[6%] top-[58%] h-72 w-[32rem] rounded-full bg-white/45 blur-3xl" />

        {/* Ambient bottom haze */}
        <div className="absolute -bottom-24 -left-16 h-72 w-[36rem] rounded-full bg-white/60 blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-72 w-[40rem] rounded-full bg-white/50 blur-3xl" />

        {/* Giant watermark */}
        <div className="absolute inset-0 flex items-center justify-center -mt-8">
          <motion.span
            initial={{ opacity: 0, scale: 1.12, filter: "blur(24px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: [0, -22] }}
            transition={{
              opacity: { duration: 1.6, ease },
              scale: { duration: 1.6, ease },
              filter: { duration: 1.6, ease },
              y: { duration: 3.6, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
            }}
            className={`${notoSansJp.className} select-none text-[38vw] font-black leading-none text-sky-200/30`}
          >
            青空
          </motion.span>
        </div>

        {/* Drifting clouds — above the watermark */}
        {clouds.map((c, i) => (
          <Cloud key={i} style={{ top: c.top, width: c.w, opacity: c.opacity, animationDuration: c.dur, animationDelay: c.delay }} />
        ))}
      </div>

      {/* Vertical Japanese tagline accent */}
      <div className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 md:block lg:right-10">
        <motion.p
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease, delay: 0.9 }}
          className="select-none text-lg tracking-[0.35em] text-sky-900/30"
          style={{ writingMode: "vertical-rl", fontFamily: "serif" }}
        >
          青空の下で、物語が始まる。
        </motion.p>
      </div>

      {/* Back link */}
      <Link
        href="/"
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 text-sm font-medium text-sky-900/60 transition-colors hover:text-sky-900 md:left-8 md:top-8"
      >
        <ArrowLeft className="size-4" />
        Ranobe Hub
      </Link>

      {/* Hero */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-0 flex flex-1 flex-col items-center justify-center px-6 py-24 text-center"
      >
        <motion.div variants={logoVariant}>
          <Image
            src="/aozora/aozora-logo.png"
            alt="Aozora"
            width={808}
            height={603}
            priority
            className="h-auto w-[260px] select-none drop-shadow-[0_12px_40px_rgba(30,64,120,0.18)] sm:w-[320px]"
          />
        </motion.div>

        <motion.p variants={rise} className="mt-6 max-w-xl text-base font-light leading-relaxed text-slate-600 sm:text-lg">
          Trình đọc EPUB dành cho người học tiếng Nhật. Đọc light novel &amp; manga với từ điển tiếng Nhật tích hợp, tạo flashcard Anki, đọc tiểu
          thuyết với giọng waifu và nhiều tính năng khác.
        </motion.p>

        <motion.div variants={pillsWrap} className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {features.map((f) => (
            <motion.span
              key={f}
              variants={pop}
              className="rounded-full border border-sky-300/70 bg-white/60 px-3 py-1 text-xs font-medium text-sky-800/90 backdrop-blur-sm"
            >
              {f}
            </motion.span>
          ))}
        </motion.div>

        <motion.div variants={rise} className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href={WEB_URL}
            target="_blank"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
          >
            <Globe className="size-4 transition-transform duration-500 group-hover:rotate-12" />
            Đọc trên Web
          </Link>
          <Link
            href={DESKTOP_URL}
            target="_blank"
            className="group inline-flex items-center gap-2 rounded-full border border-sky-300/80 bg-white/70 px-6 py-3 text-sm font-semibold text-sky-900 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md hover:shadow-sky-200/60"
          >
            <Download className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            Tải bản Desktop
          </Link>
        </motion.div>

        <motion.p variants={rise} className="mt-6 text-xs font-light text-slate-500">
          Chi tiết tính năng &amp; mã nguồn •{" "}
          <Link
            href={REPO_URL}
            target="_blank"
            className="font-medium text-sky-700 underline-offset-2 transition-colors hover:text-sky-900 hover:underline"
          >
            Github
          </Link>{" "}
        </motion.p>
      </motion.div>
    </main>
  );
}
