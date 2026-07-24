import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Xóa file nếu tồn tại (async version)
 * @param filePath - Đường dẫn tuyệt đối đến file
 * @returns True nếu xóa thành công hoặc file không tồn tại, false nếu có lỗi
 */
export async function deleteFileIfExists(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      // File không tồn tại - không phải lỗi
      return true;
    }
    console.error(`Error deleting file ${filePath}:`, err);
    return false;
  }
}

/**
 * Xóa file cũ khi update (cover hoặc ebook)
 * @param filename - Tên file cũ
 * @param uploadType - Loại upload: 'covers' hoặc 'ebooks'
 * @param defaultFilename - Tên file mặc định (không xóa nếu trùng)
 */
export async function deleteOldFile(filename: string, uploadType = "ebooks", defaultFilename: string | null = null): Promise<boolean> {
  if (defaultFilename && filename === defaultFilename) {
    return true; // Không xóa file mặc định
  }

  const filePath = path.join(__dirname, `../uploads/${uploadType}`, filename);
  return await deleteFileIfExists(filePath);
}

/**
 * Tạo thư mục nếu chưa tồn tại (async version)
 */
export async function createDirIfNotExists(dirPath: string): Promise<boolean> {
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
 */
export async function initializeUploadDirs(): Promise<void> {
  const baseDir = path.join(__dirname, "../uploads");
  const dirs = [baseDir, path.join(baseDir, "covers"), path.join(baseDir, "ebooks")];

  for (const dir of dirs) {
    await createDirIfNotExists(dir);
  }
}
