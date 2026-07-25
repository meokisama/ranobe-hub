import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Smooth-scrolls so the ref'd element sits `offset`px below the viewport top. */
export function scrollToRef(ref: { current: HTMLElement | null }, offset = 50) {
  const el = ref.current;
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
}
