/**
 * Client-side EPUB metadata extraction for the admin upload form.
 *
 * Ported (trimmed) from aozora-web's `src/lib/epub/` — reads only the few entries
 * needed (container.xml → OPF → cover image) to auto-fill title / author / cover,
 * so the admin doesn't retype them. Runs entirely in the browser; no backend work.
 */

import { BlobReader, BlobWriter, TextWriter, ZipReader, configure, type Entry } from "@zip.js/zip.js";
import { XMLParser } from "fast-xml-parser";

// No web workers: metadata reads only touch a few small entries, and this keeps
// the module drop-in under Next.js without worker/CSP plumbing.
configure({ useWebWorkers: false });

// fast-xml-parser yields loose records keyed by attribute (`@_…`) / text (`#text`);
// we don't model the full OPF schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type XmlNode = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OpfContents = Record<string, any>;

const xmlParser = new XMLParser({ ignoreAttributes: false });

// ---- OPF accessors ---------------------------------------------------------
// Most EPUBs use an unprefixed root (`<package>`); some namespace it (`<opf:package>`).
// These normalise over both forms.

function isOpfPrefixed(contents: OpfContents): boolean {
  return contents["opf:package"] !== undefined;
}
function root(contents: OpfContents): XmlNode {
  return isOpfPrefixed(contents) ? contents["opf:package"] : contents.package;
}
const key = (contents: OpfContents, base: string) => (isOpfPrefixed(contents) ? `opf:${base}` : base);

function getManifestItems(contents: OpfContents): XmlNode[] {
  const manifest = root(contents)[key(contents, "manifest")];
  return asArray(manifest?.[key(contents, "item")]);
}
function getSpineItemRefs(contents: OpfContents): XmlNode[] {
  const spine = root(contents)[key(contents, "spine")];
  return asArray(spine?.[key(contents, "itemref")]);
}
function getMetadata(contents: OpfContents): XmlNode | undefined {
  return root(contents)[key(contents, "metadata")];
}
function getMetaKey(contents: OpfContents): string {
  return key(contents, "meta");
}

function asArray<T = unknown>(value: T | T[] | null | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** dc:* fields may be a string, an object with `#text`, or an array of either. */
function firstText(value: unknown): string {
  for (const entry of asArray(value)) {
    if (typeof entry === "string" && entry.trim()) return entry.trim();
    if (entry && typeof entry === "object") {
      const text = (entry as Record<string, unknown>)["#text"];
      if (text) return String(text).trim();
    }
  }
  return "";
}

// ---- Path helpers (inlined so we don't need path-browserify) ---------------

function posixDirname(p: string): string {
  const i = p.lastIndexOf("/");
  return i === -1 ? "" : p.slice(0, i);
}
/** Joins an OPF-relative href onto the OPF's dir, resolving `.`/`..` segments. */
function posixJoin(dir: string, rel: string): string {
  const out: string[] = [];
  for (const seg of `${dir}/${rel}`.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return out.join("/");
}

// ---- OPF location + cover resolution ---------------------------------------

async function locateOpf(fileMap: Map<string, Entry>): Promise<{ contents: OpfContents; opfPath: string }> {
  const containerEntry = fileMap.get("META-INF/container.xml");
  if (!containerEntry || containerEntry.directory || !containerEntry.getData) throw new Error("Invalid EPUB: missing container.xml");
  const container = xmlParser.parse(await containerEntry.getData(new TextWriter()));
  const rootFiles = container.container.rootfiles.rootfile;
  const rootFile = Array.isArray(rootFiles) ? rootFiles[0] : rootFiles;
  const opfPath = rootFile["@_full-path"];

  const opfEntry = fileMap.get(opfPath);
  if (!opfEntry || opfEntry.directory || !opfEntry.getData) throw new Error(`Invalid EPUB: missing OPF at ${opfPath}`);
  const opfXml = await opfEntry.getData(new TextWriter());
  return { contents: xmlParser.parse(opfXml), opfPath };
}

function resolveCoverHref(manifestItems: XmlNode[], metadata: XmlNode | undefined, metaKey: string, spineRefs: XmlNode[]): string | null {
  // EPUB3: a manifest item flagged properties="cover-image".
  const byProperty = manifestItems.find((item) => item["@_properties"] === "cover-image");
  if (byProperty) return byProperty["@_href"];

  // EPUB2: <meta name="cover" content="<itemId>"> → manifest item href.
  const coverMeta = asArray(metadata?.[metaKey]).find((m) => m && m["@_name"] === "cover");
  const coverId = coverMeta?.["@_content"];
  if (coverId) {
    const item = manifestItems.find((it) => it["@_id"] === coverId);
    if (item?.["@_href"]) return item["@_href"];
  }

  // Fallback for fixed-layout/manga with no cover metadata: the first spine item
  // is the cover, when it's an image.
  const firstIdref = spineRefs[0]?.["@_idref"];
  if (firstIdref) {
    const item = manifestItems.find((it) => it["@_id"] === firstIdref);
    if (item && (item["@_media-type"] || "").startsWith("image/")) return item["@_href"] ?? null;
  }
  return null;
}

interface EpubMetadata {
  title: string;
  author: string;
  /** dc:date, raw string as authored (may be a full ISO timestamp or just a year). */
  date: string;
  language: string;
  coverBytes: ArrayBuffer | null;
  coverMime: string | null;
}

/** Extracts display metadata + cover from an EPUB blob, reading only the entries
 *  needed (container.xml, the OPF, and the cover image). */
async function extractEpubMetadata(blob: Blob): Promise<EpubMetadata> {
  const reader = new ZipReader(new BlobReader(blob));
  try {
    const entries = await reader.getEntries();
    const fileMap = new Map(entries.map((e) => [e.filename, e]));

    const { contents, opfPath } = await locateOpf(fileMap);
    const manifestItems = getManifestItems(contents);
    const spineRefs = getSpineItemRefs(contents);
    const metadata = getMetadata(contents);
    const metaKey = getMetaKey(contents);

    const title = firstText(metadata?.["dc:title"]) || "";
    const author = firstText(metadata?.["dc:creator"]);
    const date = firstText(metadata?.["dc:date"]);
    const language = firstText(metadata?.["dc:language"]) || "ja";

    let coverBytes: ArrayBuffer | null = null;
    let coverMime: string | null = null;
    const coverHref = resolveCoverHref(manifestItems, metadata, metaKey, spineRefs);
    if (coverHref) {
      const coverPath = posixJoin(posixDirname(opfPath), coverHref);
      const coverEntry =
        fileMap.get(coverPath) || fileMap.get(coverHref) || fileMap.get(decodeURIComponent(coverPath)) || fileMap.get(decodeURIComponent(coverHref));
      const coverItem = manifestItems.find((it) => it["@_href"] === coverHref);
      coverMime = coverItem?.["@_media-type"] || "image/jpeg";
      if (coverEntry && !coverEntry.directory) {
        const coverBlob = await coverEntry.getData<Blob>(new BlobWriter(coverMime ?? undefined));
        coverBytes = await coverBlob.arrayBuffer();
      }
    }

    return { title, author, date, language, coverBytes, coverMime };
  } finally {
    await reader.close();
  }
}

// ---- Cover downscaling -----------------------------------------------------

/** Master cover width cap. EPUB covers range from ~200px to 3000px+; capping at
 *  600px keeps them crisp anywhere on the site while cutting multi-MB covers to
 *  ~100KB. Never upscales past the source. */
const COVER_MAX_WIDTH = 600;
const COVER_JPEG_QUALITY = 0.85;

/**
 * Downscales cover bytes to at most `maxWidth` px wide and returns a JPEG `File`
 * ready to append to the upload FormData. Falls back to a File wrapping the raw
 * bytes if the image can't be decoded/drawn (e.g. no canvas). Returns null for
 * empty input.
 */
async function resizeCoverToFile(
  bytes: ArrayBuffer | null | undefined,
  mime: string | null,
  filename = "cover.jpg",
  maxWidth = COVER_MAX_WIDTH,
): Promise<File | null> {
  if (!bytes || bytes.byteLength === 0) return null;
  const rawFile = () => new File([bytes], filename, { type: mime || "image/jpeg" });
  try {
    const bitmap = await createImageBitmap(new Blob([bytes], { type: mime || "image/jpeg" }));
    const scale = Math.min(1, maxWidth / bitmap.width); // never upscale
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return rawFile();
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", COVER_JPEG_QUALITY));
    if (!blob) return rawFile();
    return new File([blob], filename, { type: "image/jpeg" });
  } catch {
    return rawFile();
  }
}

interface EpubFormPrefill {
  title: string;
  author: string;
  /** yyyy-mm-dd for a <input type="date">, or "" when dc:date isn't cleanly parseable. */
  releaseDate: string;
  coverFile: File | null;
}

/** One-call helper for the upload form: extracts metadata, downscales the cover,
 *  and normalises dc:date to yyyy-mm-dd (best-effort). */
export async function extractEpubForForm(file: Blob): Promise<EpubFormPrefill> {
  const meta = await extractEpubMetadata(file);
  const coverFile = await resizeCoverToFile(meta.coverBytes, meta.coverMime);
  return {
    title: meta.title,
    author: meta.author,
    releaseDate: normalizeDate(meta.date),
    coverFile,
  };
}

/** Best-effort dc:date → yyyy-mm-dd. Handles full ISO dates and bare years;
 *  returns "" for anything else so the field stays empty rather than wrong. */
function normalizeDate(raw: string): string {
  if (!raw) return "";
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const year = raw.match(/^(\d{4})$/);
  if (year) return `${year[1]}-01-01`;
  return "";
}
