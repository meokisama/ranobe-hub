import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Xóa file nếu tồn tại (async version)
 * @param {string} filePath - Đường dẫn tuyệt đối đến file
 * @returns {Promise<boolean>} - True nếu xóa thành công hoặc file không tồn tại, false nếu có lỗi
 */
export async function deleteFileIfExists(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") {
      // File không tồn tại - không phải lỗi
      return true;
    }
    console.error(`Error deleting file ${filePath}:`, err);
    return false;
  }
}

/**
 * Xóa file cũ khi update (cover hoặc ebook)
 * @param {string} filename - Tên file cũ
 * @param {string} uploadType - Loại upload: 'covers' hoặc 'ebooks'
 * @param {string} defaultFilename - Tên file mặc định (không xóa nếu trùng)
 * @returns {Promise<boolean>}
 */
export async function deleteOldFile(filename, uploadType = "ebooks", defaultFilename = null) {
  if (defaultFilename && filename === defaultFilename) {
    return true; // Không xóa file mặc định
  }

  const filePath = path.join(__dirname, `../uploads/${uploadType}`, filename);
  return await deleteFileIfExists(filePath);
}

/**
 * Tạo thư mục nếu chưa tồn tại (async version)
 * @param {string} dirPath - Đường dẫn thư mục
 * @returns {Promise<boolean>}
 */
export async function createDirIfNotExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Ensured directory exists: ${dirPath}`);
    return true;
  } catch (err) {
    console.error(`Error creating directory ${dirPath}:`, err);
    return false;
  }
}

/**
 * Tạo tất cả thư mục upload cần thiết
 * @returns {Promise<void>}
 */
export async function initializeUploadDirs() {
  const baseDir = path.join(__dirname, "../uploads");
  const dirs = [baseDir, path.join(baseDir, "covers"), path.join(baseDir, "ebooks")];

  for (const dir of dirs) {
    await createDirIfNotExists(dir);
  }
}
