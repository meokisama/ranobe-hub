// Đặt lại field `epub` của Hako về dạng https://r2.ranobe.vn/hako/epub/{hakoId}.epub
// Idempotent — bỏ qua record không có hakoId.
//
// Usage (từ thư mục backend/):
//   node scripts/update-hako-epub-urls.js              # cập nhật thật
//   node scripts/update-hako-epub-urls.js --dry-run    # preview, không ghi DB

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Hako from "../models/Hako.js";

// Load backend/.env bất kể script chạy từ CWD nào (config/db.js đọc env tại call-time).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const EPUB_BASE = "https://r2.ranobe.vn/hako/epub/";
const buildUrl = (hakoId) => `${EPUB_BASE}${hakoId}.epub`;
const BATCH = 500;

const dryRun = process.argv.slice(2).includes("--dry-run");

async function main() {
  await connectDB();
  if (mongoose.connection.readyState !== 1) {
    console.error("MongoDB chưa kết nối. Hủy cập nhật.");
    process.exit(1);
  }

  try {
    const filter = { hakoId: { $exists: true, $nin: [null, ""] } };
    const docs = await Hako.find(filter).select("hakoId epub").lean();
    console.log(`Tìm thấy ${docs.length} hako có hakoId.`);

    if (docs.length === 0) {
      console.log("Không có gì để cập nhật.");
      return;
    }

    if (dryRun) {
      console.log("Dry-run — 5 ví dụ sẽ được ghi:");
      for (const h of docs.slice(0, 5)) {
        console.log(`  ${h.hakoId}: ${h.epub ?? "(null)"} -> ${buildUrl(h.hakoId)}`);
      }
      return;
    }

    // Build ops với $set thường (không pipeline) để tránh quyền aggregate.
    const now = new Date();
    const ops = docs.map((h) => ({
      updateOne: {
        filter: { _id: h._id },
        update: { $set: { epub: buildUrl(h.hakoId), updatedAt: now } },
      },
    }));

    let matched = 0;
    let modified = 0;
    for (let i = 0; i < ops.length; i += BATCH) {
      const slice = ops.slice(i, i + BATCH);
      const res = await Hako.bulkWrite(slice, { ordered: false });
      matched += res.matchedCount ?? 0;
      modified += res.modifiedCount ?? 0;
      console.log(`Batch ${i / BATCH + 1}: match=${res.matchedCount}, modify=${res.modifiedCount}`);
    }

    console.log("== Done ==");
    console.log(`Matched: ${matched}, Modified: ${modified}`);
  } catch (err) {
    console.error("Cập nhật failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
