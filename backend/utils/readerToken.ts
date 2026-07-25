import crypto from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/config.js";

const PURPOSE = "reader";

interface ReaderTokenPayload extends JwtPayload {
  book: string;
  purpose: string;
}

/**
 * Token issued to a reader to download one specific ebook. Bound to the file name
 * (without the .epub extension) with a short expiry, so a leaked download link is
 * useless after a few minutes and one token can't open a different book.
 */
export function signReaderToken(book: string): string {
  return jwt.sign({ book, purpose: PURPOSE }, config.JWT_SECRET, { expiresIn: "10m" });
}

export function verifyReaderToken(token: string, book: string): ReaderTokenPayload {
  const decoded = jwt.verify(token, config.JWT_SECRET) as ReaderTokenPayload;
  if (decoded.purpose !== PURPOSE || decoded.book !== book) {
    throw new Error("Invalid reader token");
  }
  return decoded;
}

/**
 * Stable per-book AES-256 key derived from the server secret. Never leaves the
 * server except when handed to a reader via the (referer-gated) token endpoint.
 */
export function bookKey(book: string): Buffer {
  return crypto.createHash("sha256").update(`reader-epub:${config.JWT_SECRET}:${book}`).digest();
}

/**
 * Encrypt epub content sent to the reader. Format: iv(12) || ciphertext || tag(16).
 * The reader decrypts in memory (WebCrypto) before parsing, so "save response"
 * yields only ciphertext, not a usable .epub file.
 */
export function encryptEpub(buf: Buffer, key: Buffer): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(buf), cipher.final()]);
  return Buffer.concat([iv, ciphertext, cipher.getAuthTag()]);
}
