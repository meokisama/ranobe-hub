import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import compression from "compression";
import ebookRoutes from "./routes/ebookRoutes.js";
import konoranoRoutes from "./routes/konoranoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import publisherRoutes from "./routes/publisherRoutes.js";
import subscriberRoutes from "./routes/subscriberRoutes.js";
import connectDB from "./config/db.js";
import { apiLimiter, uploadLimiter } from "./middleware/security.js";
import { initializeUploadDirs } from "./utils/fileManager.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3001;

// Initialize upload directories
(async () => {
  await initializeUploadDirs();
})();

// CORS configuration
const allowedOrigins = ["https://hub.ranobe.vn", "http://localhost:3002", process.env.FRONTEND_URL].filter(Boolean);

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
app.use("/api/publishers", apiLimiter);
app.use("/api/subscribers", apiLimiter);

// Routes
app.use("/api/ebooks", ebookRoutes);
app.use("/api/konoranos", konoranoRoutes);
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

const ebookStatic = express.static(path.join(__dirname, "uploads", "ebooks"), {
  maxAge: "30d",
  immutable: true,
});

app.use("/uploads/ebooks", (req, res, next) => {
  const referer = req.get("referer");
  if (!referer) {
    return res.status(403).sendFile(path.join(__dirname, "error", "403.html"));
  }
  try {
    const refererUrl = new URL(referer);
    const host = req.get("host");
    if (refererUrl.host === host && (refererUrl.pathname.startsWith("/reader") || refererUrl.pathname.startsWith("/admin"))) {
      if (!path.extname(req.path)) {
        const queryIdx = req.url.indexOf("?");
        req.url = queryIdx === -1 ? req.url + ".epub" : req.url.slice(0, queryIdx) + ".epub" + req.url.slice(queryIdx);
      }
      return ebookStatic(req, res, next);
    }
  } catch (error) {
    console.error("Invalid referer URL:", error);
  }
  res.status(403).sendFile(path.join(__dirname, "error", "403.html"));
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
