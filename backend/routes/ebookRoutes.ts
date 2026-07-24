import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import * as ebookController from "../controllers/ebookController.js";
import { cache } from "../middleware/cache.js";
import { uploadLimiter } from "../middleware/security.js";
import { createUploadMiddleware, ebookUploadConfig } from "../utils/multerConfig.js";
import { validateEbook, validateObjectId, validatePagination } from "../middleware/validation.js";

const router = express.Router();

// Tạo upload middleware từ config
const uploadFields = createUploadMiddleware(ebookUploadConfig);

// @route   GET api/ebooks
// @desc    Lấy tất cả ebook (với pagination)
// @access  Public
router.get("/", [...validatePagination, cache(300)], ebookController.getAllEbooks);

// @route   GET api/ebooks/:id
// @desc    Lấy ebook theo ID
// @access  Public
router.get("/:id", [...validateObjectId, cache(600)], ebookController.getEbookById);

// @route   POST api/ebooks
// @desc    Tạo ebook mới
// @access  Admin
router.post("/", [adminAuth, uploadLimiter, uploadFields, ...validateEbook], ebookController.createEbook);

// @route   PUT api/ebooks/:id
// @desc    Cập nhật ebook
// @access  Admin
router.put("/:id", [adminAuth, uploadLimiter, ...validateObjectId, uploadFields, ...validateEbook], ebookController.updateEbook);

// @route   DELETE api/ebooks/:id
// @desc    Xóa ebook
// @access  Admin
router.delete("/:id", [adminAuth, ...validateObjectId], ebookController.deleteEbook);

export default router;
