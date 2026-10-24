"use client";

import { MotionConfig } from "motion/react";

/** Makes every motion component under the public site honour the OS reduced-motion setting. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
