// Import hako data từ data/hako.json vào MongoDB.
// Usage (từ thư mục backend/):
//   node scripts/import-hako.js                       # đọc ../data/hako.json
//   node scripts/import-hako.js path/to/hako.json     # đường dẫn tùy chỉnh
//   node scripts/import-hako.js --replace             # xóa toàn bộ collection trước khi insert
//
// Upsert theo hakoId — chạy lại an toàn (idempotent).

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Hako from "../models/Hako.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const replace = args.includes("--replace");
const inputPath = args.find((a) => !a.startsWith("--")) || path.resolve(__dirname, "hako.json");

// "DD/MM/YYYY" -> Date (UTC midnight). Trả null nếu không parse được.
function parseDMY(str) {
  if (!str || typeof str !== "string") return null;
  const m = str.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(d.getTime()) ? null : d;
}

const stripBOM = (s) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

async function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Không tìm thấy file: ${inputPath}`);
    process.exit(1);
  }

  const records = JSON.parse(stripBOM(fs.readFileSync(inputPath, "utf8")));
  if (!Array.isArray(records)) {
    console.error("File JSON phải là một array.");
    process.exit(1);
  }

  console.log(`Đọc ${records.length} entries từ ${inputPath}`);

  await connectDB();
  // connectDB() không reject khi fail ngoài production → kiểm tra readyState
  if (mongoose.connection.readyState !== 1) {
    console.error("MongoDB chưa kết nối. Hủy import.");
    process.exit(1);
  }

  try {
    if (replace) {
      const { deletedCount } = await Hako.deleteMany({});
      console.log(`--replace: đã xóa ${deletedCount} hako cũ.`);
    }

    let skippedNoHakoId = 0;
    let badDate = 0;
    const ops = [];
    for (const r of records) {
      if (!r.hakoId) {
        skippedNoHakoId++;
        continue;
      }
      const lastUpdated = parseDMY(r.lastUpdated);
      if (r.lastUpdated && !lastUpdated) badDate++;

      ops.push({
        updateOne: {
          filter: { hakoId: String(r.hakoId) },
          update: {
            $set: {
              hakoId: String(r.hakoId),
              name: r.name,
              uploader: r.uploader ?? "",
              translator: r.translator ?? "",
              lastUpdated,
              epub: r.epub ?? null,
              pdf: r.pdf ?? null,
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          upsert: true,
        },
      });
    }

    if (ops.length === 0) {
      console.log("Không có record nào để import.");
      return;
    }

    // Chia batch để tránh request quá lớn
    const BATCH = 500;
    let upserted = 0;
    let modified = 0;
    let matched = 0;
    for (let i = 0; i < ops.length; i += BATCH) {
      const slice = ops.slice(i, i + BATCH);
      const res = await Hako.bulkWrite(slice, { ordered: false });
      upserted += res.upsertedCount ?? 0;
      modified += res.modifiedCount ?? 0;
      matched += res.matchedCount ?? 0;
      console.log(`Batch ${i / BATCH + 1}: upsert=${res.upsertedCount}, modify=${res.modifiedCount}, match=${res.matchedCount}`);
    }

    console.log("== Done ==");
    console.log(`Total ops: ${ops.length}`);
    console.log(`Skipped (no hakoId): ${skippedNoHakoId}`);
    console.log(`Bad lastUpdated (set null): ${badDate}`);
    console.log(`Upserted: ${upserted}`);
    console.log(`Matched: ${matched}`);
    console.log(`Modified: ${modified}`);
    console.log(`Total in DB now: ${await Hako.countDocuments()}`);
  } catch (err) {
    console.error("Import failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
