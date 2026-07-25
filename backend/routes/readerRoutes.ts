import express, { type Request, type Response, type NextFunction } from "express";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { apiLimiter } from "../middleware/security.js";
import { signReaderToken, verifyReaderToken, bookKey, encryptEpub } from "../utils/readerToken.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.join(__dirname, "..");
const READER_DIR = path.join(BACKEND_ROOT, "reader");
const EBOOKS_DIR = path.join(BACKEND_ROOT, "uploads", "ebooks");
const ERROR_DIR = path.join(BACKEND_ROOT, "error");

const router = express.Router();

// Only issue tokens to requests from the reader/admin pages on the same host
// (deters arbitrary token farming). Referer is spoofable, so this is just a first
// hurdle — the real strength is the per-book, short-lived token below.
function fromReaderPage(req: Request): boolean {
  const referer = req.get("referer");
  if (!referer) return false;
  try {
    const url = new URL(referer);
    return url.host === req.get("host") && (url.pathname.startsWith("/reader") || url.pathname.startsWith("/admin"));
  } catch {
    return false;
  }
}

// Serve reader static assets
router.use("/reader", express.static(READER_DIR));

// Reader requests a short-lived token for the book it's about to open; required to download the epub.
router.get("/api/reader/token", apiLimiter, (req: Request, res: Response) => {
  const book = req.query.book;
  if (!book || typeof book !== "string") {
    return res.status(400).json({ msg: "Thiếu tham số book" });
  }
  if (!fromReaderPage(req)) {
    return res.status(403).json({ msg: "Truy cập không hợp lệ" });
  }
  const name = book.replace(/\.epub$/i, "");
  // Include the decryption key (only for requests past the referer gate). The epub
  // is encrypted on-the-fly on download, so this key is required to read it — and
  // "save response" in the Network tab yields only ciphertext, not a usable .epub.
  res.json({ token: signReaderToken(name), key: bookKey(name).toString("base64") });
});

// Download epub: requires a valid token (X-Reader-Token header) matching the exact
// book name, and returns the ENCRYPTED payload (AES-256-GCM). The reader decrypts in
// memory with the key from the token endpoint. Replaces the old (spoofable) Referer
// check; the token expires in 10 min so leaked links are useless, one token can't
// open another book, and you can't "save response" to rip the epub since what crosses
// the network isn't a .epub file.
router.use("/uploads/ebooks", async (req: Request, res: Response) => {
  const forbidden = () => res.status(403).sendFile(path.join(ERROR_DIR, "403.html"));
  const token = req.get("x-reader-token") || req.query.token;
  if (!token || typeof token !== "string") return forbidden();
  const name = decodeURIComponent(req.path.replace(/^\/+/, "")).replace(/\.epub$/i, "");
  try {
    verifyReaderToken(token, name);
  } catch {
    return forbidden();
  }
  // Prevent path traversal: the file must stay within EBOOKS_DIR.
  const filePath = path.join(EBOOKS_DIR, `${name}.epub`);
  if (filePath !== EBOOKS_DIR && !filePath.startsWith(EBOOKS_DIR + path.sep)) return forbidden();
  try {
    const buf = await fs.readFile(filePath);
    res.set("Content-Type", "application/octet-stream");
    res.set("Cache-Control", "no-store");
    return res.send(encryptEpub(buf, bookKey(name)));
  } catch {
    return res.status(404).sendFile(path.join(ERROR_DIR, "403.html"));
  }
});

router.get("/reader", (req: Request, res: Response, next: NextFunction) => {
  if (req.query.book) {
    return res.sendFile(path.join(READER_DIR, "index.html"));
  }
  next();
});

router.get("/reader/*splat", (_req: Request, res: Response) => {
  res.sendFile(path.join(READER_DIR, "index.html"));
});

export default router;
