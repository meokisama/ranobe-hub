const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const konoranoController = require("../controllers/konoranoController");
const { cache } = require("../middleware/cache");
const { createUploadMiddleware, konoranoUploadConfig } = require("../utils/multerConfig");
const {
  validateKonorano,
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");

// Tạo upload middleware từ config
const uploadFields = createUploadMiddleware(konoranoUploadConfig);

// @route   GET api/konoranos
// @desc    Lấy tất cả konorano (với pagination)
// @access  Public
router.get("/", [validatePagination, cache(300)], konoranoController.getAllKonoranos);

// @route   GET api/konoranos/:id
// @desc    Lấy konorano theo ID
// @access  Public
router.get("/:id", [validateObjectId, cache(600)], konoranoController.getKonoranoById);

// @route   POST api/konoranos
// @desc    Tạo konorano mới
// @access  Admin
router.post("/", [adminAuth, uploadFields, validateKonorano], konoranoController.createKonorano);

// @route   PUT api/konoranos/:id
// @desc    Cập nhật konorano
// @access  Admin
router.put("/:id", [adminAuth, validateObjectId, uploadFields, validateKonorano], konoranoController.updateKonorano);

// @route   DELETE api/konoranos/:id
// @desc    Xóa konorano
// @access  Admin
router.delete("/:id", [adminAuth, validateObjectId], konoranoController.deleteKonorano);

module.exports = router;
