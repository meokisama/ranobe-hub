const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

/**
 * Tạo multer storage configuration
 * @param {object} fieldMapping - Map field names to upload directories
 * @example { cover: 'covers', ebook: 'ebooks' }
 */
function createStorage(fieldMapping) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = fieldMapping[file.fieldname];
      if (!uploadDir) {
        return cb(new Error(`Unknown field: ${file.fieldname}`), null);
      }
      const uploadPath = path.join(__dirname, `../uploads/${uploadDir}`);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const newFilename = `${uuidv4()}${ext}`;
      cb(null, newFilename);
    },
  });
}

/**
 * Tạo file filter cho multer
 * @param {object} allowedTypes - Map field names to allowed file extensions
 * @example { cover: ['.jpg', '.png'], ebook: ['.epub', '.pdf'] }
 */
function createFileFilter(allowedTypes) {
  return function (req, file, cb) {
    const allowed = allowedTypes[file.fieldname];
    if (!allowed) {
      return cb(new Error(`Unknown field: ${file.fieldname}`), false);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      const allowedStr = allowed.join(", ");
      return cb(new Error(`Chỉ chấp nhận file: ${allowedStr} cho ${file.fieldname}`), false);
    }

    cb(null, true);
  };
}

/**
 * Tạo multer upload middleware với cấu hình
 * @param {object} config - Configuration object
 * @param {object} config.fieldMapping - Map field names to directories
 * @param {object} config.allowedTypes - Map field names to allowed extensions
 * @param {array} config.fields - Array of field configurations for upload.fields()
 * @returns {multer.Multer} - Configured multer instance
 */
function createUploadMiddleware(config) {
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
const ebookUploadConfig = {
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
const konoranoUploadConfig = {
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

module.exports = {
  createUploadMiddleware,
  ebookUploadConfig,
  konoranoUploadConfig,
};
