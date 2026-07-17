import "dotenv/config";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import compression from "compression";
import ebookRoutes from "./routes/ebookRoutes.js";
import konoranoRoutes from "./routes/konoranoRoutes.js";
import hakoRoutes from "./routes/hakoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import publisherRoutes from "./routes/publisherRoutes.js";
import subscriberRoutes from "./routes/subscriberRoutes.js";
import connectDB from "./config/db.js";
import { apiLimiter, uploadLimiter } from "./middleware/security.js";
import { initializeUploadDirs } from "./utils/fileManager.js";
import { signReaderToken, verifyReaderToken, bookKey, encryptEpub } from "./utils/readerToken.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3001;

// Initialize upload directories
(async () => {
  await initializeUploadDirs();
})();

// CORS configuration
const allowedOrigins = ["https://hub.ranobe.vn", "https://hub.lightnovel.vn", "http://localhost:3002", process.env.FRONTEND_URL].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Middleware
app.use(express.json({ limit: "10mb" })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  compression({
    threshold: 1024, // Chỉ nén các response > 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// Connect to MongoDB
connectDB();

// Áp dụng rate limiting cho các routes
app.use("/api/ebooks", apiLimiter);
app.use("/api/ebooks/upload", uploadLimiter);
app.use("/api/konoranos", apiLimiter);
app.use("/api/konoranos/upload", uploadLimiter);
app.use("/api/hakos", apiLimiter);
app.use("/api/publishers", apiLimiter);
app.use("/api/subscribers", apiLimiter);

// Routes
app.use("/api/ebooks", ebookRoutes);
app.use("/api/konoranos", konoranoRoutes);
app.use("/api/hakos", hakoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/subscribers", subscriberRoutes);

// Serve reader
app.use("/reader", express.static(path.join(__dirname, "reader")));
app.use(
  "/uploads/covers",
  express.static(path.join(__dirname, "uploads", "covers"), {
    maxAge: "30d",
    immutable: true,
  }),
);

// Chỉ cấp token cho request phát ra từ trang reader/admin cùng host (chống farm
// token tuỳ tiện). Referer có thể giả, nên đây chỉ là lớp cản đầu — sức mạnh nằm
// ở token gắn-the-sách + hết-hạn-ngắn bên dưới.
function fromReaderPage(req) {
  const referer = req.get("referer");
  if (!referer) return false;
  try {
    const url = new URL(referer);
    return url.host === req.get("host") && (url.pathname.startsWith("/reader") || url.pathname.startsWith("/admin"));
  } catch {
    return false;
  }
}

// Reader xin token ngắn hạn cho đúng cuốn sắp mở; token này bắt buộc để tải epub.
app.get("/api/reader/token", apiLimiter, (req, res) => {
  const book = req.query.book;
  if (!book || typeof book !== "string") {
    return res.status(400).json({ msg: "Thiếu tham số book" });
  }
  if (!fromReaderPage(req)) {
    return res.status(403).json({ msg: "Truy cập không hợp lệ" });
  }
  const name = book.replace(/\.epub$/i, "");
  // Kèm khóa giải mã (chỉ cấp cho request qua cổng referer). Epub được mã hóa
  // on-the-fly khi tải, nên khóa này bắt buộc để đọc — và "lưu response" ở tab
  // Network chỉ ra ciphertext, không phải một file .epub dùng được.
  res.json({ token: signReaderToken(name), key: bookKey(name).toString("base64") });
});

const EBOOKS_DIR = path.join(__dirname, "uploads", "ebooks");

// Tải epub: bắt buộc token hợp lệ (header X-Reader-Token) khớp đúng tên sách, và
// trả về BẢN MÃ HÓA (AES-256-GCM). Reader giải mã trong bộ nhớ bằng khóa lấy từ
// endpoint token. Thay cho kiểm tra Referer cũ (dễ giả); token hết hạn 10 phút
// nên link rò rỉ vô dụng, một token không mở cuốn khác, và không thể chỉ "lưu
// response" để rip epub vì nội dung qua mạng không phải file .epub.
app.use("/uploads/ebooks", async (req, res) => {
  const forbidden = () => res.status(403).sendFile(path.join(__dirname, "error", "403.html"));
  const token = req.get("x-reader-token") || req.query.token;
  if (!token || typeof token !== "string") return forbidden();
  const name = decodeURIComponent(req.path.replace(/^\/+/, "")).replace(/\.epub$/i, "");
  try {
    verifyReaderToken(token, name);
  } catch {
    return forbidden();
  }
  // Chống path traversal: tệp phải nằm gọn trong EBOOKS_DIR.
  const filePath = path.join(EBOOKS_DIR, `${name}.epub`);
  if (filePath !== EBOOKS_DIR && !filePath.startsWith(EBOOKS_DIR + path.sep)) return forbidden();
  try {
    const buf = await fs.readFile(filePath);
    res.set("Content-Type", "application/octet-stream");
    res.set("Cache-Control", "no-store");
    return res.send(encryptEpub(buf, bookKey(name)));
  } catch {
    return res.status(404).sendFile(path.join(__dirname, "error", "403.html"));
  }
});

app.get("/reader", (req, res, next) => {
  if (req.query.book) {
    return res.sendFile(path.join(__dirname, "reader", "index.html"));
  }
  next();
});

app.get("/reader/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "reader", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      msg: "CORS policy violation",
    });
  }

  console.error(err.stack);
  res.status(500).json({ msg: "Lỗi server" });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

const server = app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
