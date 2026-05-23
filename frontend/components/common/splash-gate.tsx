"use client";

import { useEffect, useState, type ReactNode } from "react";

interface SplashGateProps {
  splash: ReactNode;
  storageKey: string;
  durationMs: number;
  children: ReactNode;
}

export function SplashGate({ splash, storageKey, durationMs, children }: SplashGateProps) {
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(storageKey)) {
      setContentReady(true);
      return;
    }
    const id = setTimeout(() => setContentReady(true), durationMs);
    return () => clearTimeout(id);
  }, [storageKey, durationMs]);

  return (
    <>
      {splash}
      {contentReady && children}
    </>
  );
}
