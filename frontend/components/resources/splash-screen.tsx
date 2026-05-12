"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const TOTAL_DURATION = 5200;

const ResourcesSplashScreen = () => {
  const reduceMotion = useReducedMotion();
  const [shouldUnmount, setShouldUnmount] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("splash-resources-seen")) {
      setShouldUnmount(true);
      return;
    }

    document.body.style.overflow = "hidden";
    const timeoutId = setTimeout(() => {
      sessionStorage.setItem("splash-resources-seen", "1");
      document.body.style.overflow = "";
      setShouldUnmount(true);
    }, TOTAL_DURATION + 200);

    return () => {
      document.body.style.overflow = "";
      clearTimeout(timeoutId);
    };
  }, []);

  if (shouldUnmount) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fff7ed] via-[#fffbf3] to-[#fff1f2]"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={{
        clipPath: ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(50% 0% 50% 0%)"],
      }}
      transition={{
        duration: TOTAL_DURATION / 1000,
        times: [0, 0.86, 1],
        ease: [0.76, 0, 0.24, 1],
      }}
      style={{ willChange: "clip-path" }}
    >
      {/* Animated background orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 size-[28rem] rounded-full bg-orange-300/40 blur-3xl"
        initial={{ opacity: 0, scale: 0.6, x: -80 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-1/4 size-[32rem] rounded-full bg-rose-300/40 blur-3xl"
        initial={{ opacity: 0, scale: 0.6, x: 80 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.4, delay: 0.1, ease: "easeOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/30 blur-3xl"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1.1 }}
        transition={{ duration: 1.6, delay: 0.2, ease: "easeOut" }}
      />

      {/* Floating particles */}
      {!reduceMotion &&
        Array.from({ length: 12 }).map((_, i) => {
          const left = (i * 83) % 100;
          const delay = (i % 6) * 0.18;
          const duration = 3 + (i % 4) * 0.6;
          return (
            <motion.span
              key={i}
              aria-hidden
              className="pointer-events-none absolute size-1.5 rounded-full bg-amber-400/70 shadow-[0_0_12px_rgba(251,191,36,0.7)]"
              style={{ left: `${left}%`, top: "110%" }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: "-120vh", opacity: [0, 1, 1, 0] }}
              transition={{
                duration,
                delay: 0.6 + delay,
                ease: "easeOut",
                times: [0, 0.15, 0.85, 1],
              }}
            />
          );
        })}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Header icon — spring drop + rotation */}
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.4, rotate: -180 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 140,
            damping: 14,
            mass: 0.9,
            delay: 0.15,
          }}
          className="relative"
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-orange-400/40 via-amber-300/40 to-rose-400/40 blur-2xl"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.4, 1.1], opacity: [0, 0.9, 0.6] }}
            transition={{ duration: 1.6, delay: 0.4, ease: "easeOut" }}
          />
          <Image
            src="/header-icon.png"
            alt="Ranobe Hub"
            width={120}
            height={120}
            priority
            className="size-24 select-none pointer-events-none drop-shadow-[0_8px_24px_rgba(249,115,22,0.35)] sm:size-28"
          />
        </motion.div>

        {/* Header text — mask reveal left-to-right */}
        <motion.div
          className="mt-6 overflow-hidden"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1, delay: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <Image
            src="/header-text.png"
            alt="Ranobe Hub"
            width={300}
            height={60}
            priority
            className="h-12 w-auto select-none pointer-events-none sm:h-14"
          />
        </motion.div>

        {/* Decorative divider */}
        <div className="mt-8 flex items-center gap-3">
          <motion.span
            className="block h-px bg-gradient-to-r from-transparent via-orange-400/80 to-orange-500/80"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.7, delay: 1.3, ease: "easeOut" }}
          />
          <motion.span
            className="block size-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.55, ease: "backOut" }}
          />
          <motion.span
            className="block h-px bg-gradient-to-l from-transparent via-rose-400/80 to-rose-500/80"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.7, delay: 1.3, ease: "easeOut" }}
          />
        </div>

        {/* Loading shimmer bar */}
        <motion.div
          className="relative mt-8 h-0.5 w-48 overflow-hidden rounded-full bg-orange-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 2.6 }}
        >
          <motion.span
            className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-rose-400 shadow-[0_0_10px_rgba(249,115,22,0.6)]"
            initial={{ x: "-100%" }}
            animate={{ x: "300%" }}
            transition={{
              duration: 1.2,
              delay: 2.6,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </motion.div>
      </div>

      {/* Top/bottom hairlines that slide in from edges */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        style={{ transformOrigin: "center" }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        style={{ transformOrigin: "center" }}
      />
    </motion.div>
  );
};

export default ResourcesSplashScreen;
