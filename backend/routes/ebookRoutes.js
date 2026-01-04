const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const ebookController = require("../controllers/ebookController");
const { cache } = require("../middleware/cache");
const { createUploadMiddleware, ebookUploadConfig } = require("../utils/multerConfig");
const {
  validateEbook,
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");

// Tạo upload middleware từ config
const uploadFields = createUploadMiddleware(ebookUploadConfig);

// @route   GET api/ebooks
// @desc    Lấy tất cả ebook (với pagination)
// @access  Public
router.get("/", [validatePagination, cache(300)], ebookController.getAllEbooks);

// @route   GET api/ebooks/:id
// @desc    Lấy ebook theo ID
// @access  Public
router.get("/:id", [validateObjectId, cache(600)], ebookController.getEbookById);

// @route   POST api/ebooks
// @desc    Tạo ebook mới
// @access  Admin
router.post("/", [adminAuth, uploadFields, validateEbook], ebookController.createEbook);

// @route   PUT api/ebooks/:id
// @desc    Cập nhật ebook
// @access  Admin
router.put("/:id", [adminAuth, validateObjectId, uploadFields, validateEbook], ebookController.updateEbook);

// @route   DELETE api/ebooks/:id
// @desc    Xóa ebook
// @access  Admin
router.delete("/:id", [adminAuth, validateObjectId], ebookController.deleteEbook);

module.exports = router;
