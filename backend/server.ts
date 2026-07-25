import "dotenv/config";
import path from "node:path";
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
import readerRoutes from "./routes/readerRoutes.js";
import connectDB from "./config/db.js";
import { apiLimiter } from "./middleware/security.js";
import { initializeUploadDirs } from "./utils/fileManager.js";

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
      if (allowedOrigins.includes(origin)) {
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

// Serve public cover images
app.use(
  "/uploads/covers",
  express.static(path.join(__dirname, "uploads", "covers"), {
    maxAge: "30d",
    immutable: true,
  }),
);

// Reader SPA + secured epub token/download endpoints
app.use(readerRoutes);

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
