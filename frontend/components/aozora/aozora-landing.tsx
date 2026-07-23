"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Download, Globe } from "lucide-react";

const WEB_URL = `${process.env.NEXT_PUBLIC_API_URL}/reader`;
const DESKTOP_URL = "https://github.com/meokisama/aozora/releases";
const REPO_URL = "https://github.com/meokisama/aozora";

const features = ["Từ điển Yomitan", "Flashcard Anki", "Giọng waifu (TTS)", "Discord RP", "Tategaki", "Thống kê đọc"];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function AozoraLanding() {
  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden text-slate-800">
      {/* Sky background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "linear-gradient(to bottom, #eaf4ff 0%, #d3e9fd 38%, #b8ddfb 66%, #cfe9fc 100%)" }}
      />
      {/* Sun glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[36rem] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
      {/* Clouds */}
      <div className="pointer-events-none absolute -bottom-24 -left-16 -z-10 h-72 w-[36rem] rounded-full bg-white/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-0 -z-10 h-72 w-[40rem] rounded-full bg-white/50 blur-3xl" />
      {/* Giant watermark */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <span className="select-none text-[38vw] font-black leading-none text-sky-200/30">青空</span>
      </div>

      {/* Vertical Japanese tagline accent */}
      <p
        className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 select-none text-lg tracking-[0.35em] text-sky-900/30 md:block lg:right-10"
        style={{ writingMode: "vertical-rl", fontFamily: "serif" }}
      >
        青空の下で、物語が始まる。
      </p>

      {/* Back link */}
      <Link
        href="/"
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 text-sm font-medium text-sky-900/60 transition-colors hover:text-sky-900 md:left-8 md:top-8"
      >
        <ArrowLeft className="size-4" />
        Ranobe Hub
      </Link>

      {/* Hero */}
      <div className="relative z-0 flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          <Image
            src="/aozora/aozora-logo.png"
            alt="Aozora"
            width={808}
            height={603}
            priority
            className="h-auto w-[260px] select-none drop-shadow-[0_12px_40px_rgba(30,64,120,0.18)] sm:w-[320px]"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.25 }}
          className="mt-6 max-w-xl text-base font-light leading-relaxed text-slate-600 sm:text-lg"
        >
          Trình đọc EPUB dành cho người học tiếng Nhật. Đọc light novel &amp; manga với từ điển tiếng Nhật tích hợp, tạo flashcard Anki, đọc câu văn
          với giọng waifu và nhiều tính năng khác.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.4 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-2"
        >
          {features.map((f) => (
            <span
              key={f}
              className="rounded-full border border-sky-300/70 bg-white/60 px-3 py-1 text-xs font-medium text-sky-800/90 backdrop-blur-sm"
            >
              {f}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.55 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease, delay: 0.7 }}
          className="mt-6 text-xs font-light text-slate-500"
        >
          Chi tiết tính năng &amp; mã nguồn •{" "}
          <Link
            href={REPO_URL}
            target="_blank"
            className="font-medium text-sky-700 underline-offset-2 transition-colors hover:text-sky-900 hover:underline"
          >
            Github
          </Link>{" "}
        </motion.p>
      </div>
    </main>
  );
}
