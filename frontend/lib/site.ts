const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const SITE = {
  name: "Ranobe Hub",
  url: "https://hub.ranobe.vn",
  blog: "https://ranobe.vn",
  facebook: "https://facebook.com/TheMeoki",
  email: "hi@meoki.vn",
  aozoraRepo: "https://github.com/meokisama/aozora",
  aozoraReleases: "https://github.com/meokisama/aozora/releases",
} as const;

/** Full-size cover as stored by the backend. */
export function coverUrl(coverImage: string): string {
  return `${API_BASE}/uploads/covers/${coverImage}`;
}

/**
 * Same-origin, resized cover through the Next image optimizer. WebGL textures need
 * this: the backend only sends CORS headers to whitelisted origins, and a 384px
 * texture is plenty for a book floating in the hero.
 */
export function coverTextureUrl(coverImage: string, width: 256 | 384 | 640 = 384): string {
  return `/_next/image?url=${encodeURIComponent(coverUrl(coverImage))}&w=${width}&q=75`;
}

/** Opens a hosted book in the Aozora web reader. `filePath` is the stored epub file name. */
export function readerUrl(filePath: string): string {
  return `${API_BASE}/reader?book=${filePath.replace(/\.epub$/i, "")}`;
}

/** Opens any epub URL (e.g. the Hako mirror on R2) in the Aozora web reader. */
export function readerUrlForEpub(epubUrl: string): string {
  return `${API_BASE}/reader?book=${epubUrl}`;
}

export const AOZORA_WEB_URL = `${API_BASE}/reader`;

export const SUBSCRIBE_URL = `${API_BASE}/api/subscribers/subscribe`;
export const UNSUBSCRIBE_URL = `${API_BASE}/api/subscribers/unsubscribe`;

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#039;": "'" };

/** Some imported names arrive HTML-escaped ("Wendy&amp;Lyn"). Decodes the handful of entities that occur. */
export function decodeEntities(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot|#0?39);/g, (entity) => ENTITIES[entity] ?? entity);
}

const KANJI_DIGITS = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

/** 93 → "九三". Positional kanji numerals, the way spines and colophons print them. */
export function kanjiNumber(n: number): string {
  return String(Math.max(0, Math.trunc(n)))
    .split("")
    .map((d) => KANJI_DIGITS[Number(d)])
    .join("");
}

const DOT_DATE = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

/** ISO → "24.10.2026". Returns `fallback` for missing or unparseable input. */
export function formatDotDate(value: string | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : DOT_DATE.format(date).replace(/\//g, ".");
}
