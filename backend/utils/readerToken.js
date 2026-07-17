import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const PURPOSE = "reader";

/**
 * Token cấp cho reader để tải một cuốn ebook cụ thể. Gắn với tên file (không có
 * đuôi .epub) và hết hạn ngắn, nên link tải rò rỉ sẽ vô dụng sau ít phút và một
 * token không mở được cuốn khác.
 */
export function signReaderToken(book) {
  return jwt.sign({ book, purpose: PURPOSE }, config.JWT_SECRET, { expiresIn: "10m" });
}

export function verifyReaderToken(token, book) {
  const decoded = jwt.verify(token, config.JWT_SECRET);
  if (decoded.purpose !== PURPOSE || decoded.book !== book) {
    throw new Error("Invalid reader token");
  }
  return decoded;
}

/**
 * Khóa AES-256 ổn định cho mỗi cuốn, dẫn xuất từ bí mật server. Không bao giờ ra
 * khỏi server trừ khi được cấp cho reader qua endpoint token (đã referer-gate).
 */
export function bookKey(book) {
  return crypto.createHash("sha256").update(`reader-epub:${config.JWT_SECRET}:${book}`).digest();
}

/**
 * Mã hóa nội dung epub để trả về reader. Định dạng: iv(12) || ciphertext || tag(16).
 * Reader giải mã trong bộ nhớ (WebCrypto) trước khi parse — nên "lưu response"
 * chỉ ra ciphertext, không phải một file .epub dùng được.
 */
export function encryptEpub(buf, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(buf), cipher.final()]);
  return Buffer.concat([iv, ciphertext, cipher.getAuthTag()]);
}
