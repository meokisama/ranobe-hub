// Cập nhật toàn bộ field `epub` của collection Hako sang dạng
// https://r2.ranobe.vn/hako/epub/{hakoId}.epub
//
// Usage (từ thư mục backend/):
//   node scripts/update-hako-epub-urls.js              # cập nhật thật
//   node scripts/update-hako-epub-urls.js --dry-run    # chỉ in ra số lượng sẽ thay đổi

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Hako from "../models/Hako.js";

const BASE_URL = "https://r2.ranobe.vn/hako/epub/";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

async function main() {
  await connectDB();
  if (mongoose.connection.readyState !== 1) {
    console.error("MongoDB chưa kết nối. Hủy cập nhật.");
    process.exit(1);
  }

  try {
    const filter = { hakoId: { $exists: true, $ne: null, $ne: "" } };
    const total = await Hako.countDocuments(filter);
    console.log(`Tìm thấy ${total} hako có hakoId.`);

    if (dryRun) {
      const sample = await Hako.find(filter).limit(5).select("hakoId epub").lean();
      console.log("--dry-run: 5 ví dụ sẽ được cập nhật:");
      for (const h of sample) {
        console.log(`  ${h.hakoId}: ${h.epub ?? "(null)"} -> ${BASE_URL}${h.hakoId}.epub`);
      }
      return;
    }

    const res = await Hako.updateMany(filter, [
      {
        $set: {
          epub: { $concat: [BASE_URL, "$hakoId", ".epub"] },
          updatedAt: new Date(),
        },
      },
    ]);

    console.log("== Done ==");
    console.log(`Matched: ${res.matchedCount}`);
    console.log(`Modified: ${res.modifiedCount}`);
  } catch (err) {
    console.error("Cập nhật failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
