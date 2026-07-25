"use client";

import { useEffect, useState } from "react";

/** Which body style the splash uses to block scrolling while it plays. */
export type ScrollLock = "fixed" | "overflow";

function lock(mode: ScrollLock) {
  if (mode === "fixed") {
    document.body.style.position = "fixed";
    document.body.style.width = "100vw";
  } else {
    document.body.style.overflow = "hidden";
  }
}

function unlock(mode: ScrollLock) {
  if (mode === "fixed") {
    document.body.style.position = "";
    document.body.style.width = "";
  } else {
    document.body.style.overflow = "";
  }
}

/**
 * Plays a splash once per session: returns false while it should stay mounted.
 *
 * Already seen this session → resolves on the next tick instead of synchronously,
 * since sessionStorage can't be read during render without a hydration mismatch.
 */
export function useSplashGate(storageKey: string, durationMs: number, scrollLock: ScrollLock): boolean {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(storageKey) !== null;
    if (!seen) lock(scrollLock);

    const timeoutId = setTimeout(
      () => {
        sessionStorage.setItem(storageKey, "1");
        unlock(scrollLock);
        setDone(true);
      },
      seen ? 0 : durationMs,
    );

    return () => {
      clearTimeout(timeoutId);
      unlock(scrollLock);
    };
  }, [storageKey, durationMs, scrollLock]);

  return done;
}
