import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Delete a file if it exists.
 * @param filePath - Absolute path to the file
 * @returns true on success or if the file is missing, false on error
 */
export async function deleteFileIfExists(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      // File doesn't exist — not an error
      return true;
    }
    console.error(`Error deleting file ${filePath}:`, err);
    return false;
  }
}

/**
 * Delete an old file on update (cover or ebook).
 * @param filename - Old file name
 * @param uploadType - Upload type: 'covers' or 'ebooks'
 * @param defaultFilename - Default file name; never deleted
 */
export async function deleteOldFile(filename: string, uploadType = "ebooks", defaultFilename: string | null = null): Promise<boolean> {
  if (defaultFilename && filename === defaultFilename) {
    return true; // Never delete the default file
  }

  const filePath = path.join(__dirname, `../uploads/${uploadType}`, filename);
  return await deleteFileIfExists(filePath);
}

/** Create a directory if it doesn't exist. */
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

/** Create all required upload directories. */
export async function initializeUploadDirs(): Promise<void> {
  const baseDir = path.join(__dirname, "../uploads");
  const dirs = [baseDir, path.join(baseDir, "covers"), path.join(baseDir, "ebooks")];

  for (const dir of dirs) {
    await createDirIfNotExists(dir);
  }
}
