import multer from "multer";
import type { Request } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v4 as uuidv4 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface UploadConfig {
  /** Map field names to upload directories, ví dụ { cover: 'covers', ebook: 'ebooks' } */
  fieldMapping: Record<string, string>;
  /** Map field names to allowed file extensions, ví dụ { cover: ['.jpg'], ebook: ['.epub'] } */
  allowedTypes: Record<string, string[]>;
  /** Field configurations cho upload.fields() */
  fields: readonly multer.Field[];
}

/**
 * Tạo multer storage configuration
 */
function createStorage(fieldMapping: Record<string, string>): multer.StorageEngine {
  return multer.diskStorage({
    destination: function (_req: Request, file: Express.Multer.File, cb) {
      const uploadDir = fieldMapping[file.fieldname];
      if (!uploadDir) {
        return cb(new Error(`Unknown field: ${file.fieldname}`), "");
      }
      const uploadPath = path.join(__dirname, `../uploads/${uploadDir}`);
      cb(null, uploadPath);
    },
    filename: function (_req: Request, file: Express.Multer.File, cb) {
      const ext = path.extname(file.originalname);
      const newFilename = `${uuidv4()}${ext}`;
      cb(null, newFilename);
    },
  });
}

/**
 * Tạo file filter cho multer
 */
function createFileFilter(allowedTypes: Record<string, string[]>) {
  return function (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const allowed = allowedTypes[file.fieldname];
    if (!allowed) {
      return cb(new Error(`Unknown field: ${file.fieldname}`));
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      const allowedStr = allowed.join(", ");
      return cb(new Error(`Chỉ chấp nhận file: ${allowedStr} cho ${file.fieldname}`));
    }

    cb(null, true);
  };
}

/**
 * Tạo multer upload middleware với cấu hình
 */
export function createUploadMiddleware(config: UploadConfig) {
  const { fieldMapping, allowedTypes, fields } = config;

  const storage = createStorage(fieldMapping);
  const fileFilter = createFileFilter(allowedTypes);

  const upload = multer({
    storage,
    fileFilter,
  });

  return upload.fields(fields);
}

/**
 * Cấu hình upload cho Ebook
 */
export const ebookUploadConfig: UploadConfig = {
  fieldMapping: {
    cover: "covers",
    ebook: "ebooks",
  },
  allowedTypes: {
    cover: [".jpg", ".jpeg", ".png", ".gif"],
    ebook: [".epub", ".pdf"],
  },
  fields: [
    { name: "cover", maxCount: 1 },
    { name: "ebook", maxCount: 1 },
  ],
};

/**
 * Cấu hình upload cho Konorano
 */
export const konoranoUploadConfig: UploadConfig = {
  fieldMapping: {
    cover: "covers",
    konorano: "ebooks",
  },
  allowedTypes: {
    cover: [".jpg", ".jpeg", ".png", ".gif"],
    konorano: [".epub", ".pdf"],
  },
  fields: [
    { name: "cover", maxCount: 1 },
    { name: "konorano", maxCount: 1 },
  ],
};
