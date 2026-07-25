import "dotenv/config";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import ebookRoutes from "./routes/ebookRoutes.js";
import konoranoRoutes from "./routes/konoranoRoutes.js";
import hakoRoutes from "./routes/hakoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import publisherRoutes from "./routes/publisherRoutes.js";
import subscriberRoutes from "./routes/subscriberRoutes.js";
import connectDB from "./config/db.js";
import { apiLimiter } from "./middleware/security.js";
import { initializeUploadDirs } from "./utils/fileManager.js";
import { signReaderToken, verifyReaderToken, bookKey, encryptEpub } from "./utils/readerToken.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3001;

// Initialize upload directories (fire-and-forget at startup)
void initializeUploadDirs();

// CORS configuration
const allowedOrigins = ["https://hub.ranobe.vn", "https://hub.lightnovel.vn", "http://localhost:3002", process.env.FRONTEND_URL].filter(
  Boolean,
) as string[];

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
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// Connect to MongoDB (mongoose buffers commands until connected)
void connectDB();

// Apply rate limiting to the routes.
// uploadLimiter (stricter) is attached directly to the POST/PUT upload routes
// inside ebookRoutes/konoranoRoutes, not mounted here.
app.use("/api/ebooks", apiLimiter);
app.use("/api/konoranos", apiLimiter);
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

// Reader requests a short-lived token for the book it's about to open; required to download the epub.
app.get("/api/reader/token", apiLimiter, (req: Request, res: Response) => {
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

const EBOOKS_DIR = path.join(__dirname, "uploads", "ebooks");

// Download epub: requires a valid token (X-Reader-Token header) matching the exact
// book name, and returns the ENCRYPTED payload (AES-256-GCM). The reader decrypts in
// memory with the key from the token endpoint. Replaces the old (spoofable) Referer
// check; the token expires in 10 min so leaked links are useless, one token can't
// open another book, and you can't "save response" to rip the epub since what crosses
// the network isn't a .epub file.
app.use("/uploads/ebooks", async (req: Request, res: Response) => {
  const forbidden = () => res.status(403).sendFile(path.join(__dirname, "error", "403.html"));
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
    return res.status(404).sendFile(path.join(__dirname, "error", "403.html"));
  }
});

app.get("/reader", (req: Request, res: Response, next: NextFunction) => {
  if (req.query.book) {
    return res.sendFile(path.join(__dirname, "reader", "index.html"));
  }
  next();
});

app.get("/reader/*splat", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "reader", "index.html"));
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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
