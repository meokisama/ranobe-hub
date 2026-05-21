"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Yusei_Magic } from "next/font/google";

const yusei = Yusei_Magic({
  subsets: ["latin"],
  weight: ["400"],
});

const petals = [
  { left: "8%", top: "18%", size: 34, delay: 0, duration: 7 },
  { left: "85%", top: "22%", size: 26, delay: 1.2, duration: 8 },
  { left: "18%", top: "70%", size: 32, delay: 2, duration: 6.5 },
  { left: "78%", top: "65%", size: 28, delay: 0.6, duration: 7.5 },
  { left: "50%", top: "10%", size: 22, delay: 1.8, duration: 8 },
  { left: "38%", top: "82%", size: 28, delay: 2.6, duration: 7 },
  { left: "65%", top: "85%", size: 22, delay: 0.3, duration: 6.5 },
];

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#fff5ec] via-[#ffe9e0] to-[#ffd9e4] px-6 py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 size-96 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute -right-32 bottom-10 size-96 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute select-none text-pink-400/80"
          style={{ left: p.left, top: p.top, fontSize: p.size }}
          animate={{
            y: [0, 24, 0],
            x: [0, 12, -8, 0],
            rotate: [0, 180, 360],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        >
          ❀
        </motion.span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center"
      >
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative mb-2">
          <Image
            src="/buta.png"
            alt="onsen"
            width={480}
            height={320}
            priority
            className="w-72 select-none drop-shadow-[0_14px_30px_rgba(244,114,182,0.3)] sm:w-96"
          />
        </motion.div>

        <motion.h1
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 180, damping: 14 }}
          className={`${yusei.className} flex items-end text-6xl leading-normal tracking-tight sm:text-7xl md:text-8xl`}
        >
          {"nyaaa~".split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block text-transparent bg-gradient-to-br from-rose-400 via-pink-400 to-orange-400 bg-clip-text drop-shadow-[0_2px_8px_rgba(244,114,182,0.25)]"
              animate={{
                y: [0, -14, 0],
                rotate: [0, -4, 4, 0],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6 + i * 0.12,
              }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.h1>
      </motion.div>
    </main>
  );
}
