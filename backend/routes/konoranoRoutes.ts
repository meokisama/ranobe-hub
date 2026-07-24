import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import * as konoranoController from "../controllers/konoranoController.js";
import { cache } from "../middleware/cache.js";
import { uploadLimiter } from "../middleware/security.js";
import { createUploadMiddleware, konoranoUploadConfig } from "../utils/multerConfig.js";
import { validateKonorano, validateObjectId, validatePagination } from "../middleware/validation.js";

const router = express.Router();

// Tạo upload middleware từ config
const uploadFields = createUploadMiddleware(konoranoUploadConfig);

// @route   GET api/konoranos
// @desc    Lấy tất cả konorano (với pagination)
// @access  Public
router.get("/", [...validatePagination, cache(300)], konoranoController.getAllKonoranos);

// @route   GET api/konoranos/:id
// @desc    Lấy konorano theo ID
// @access  Public
router.get("/:id", [...validateObjectId, cache(600)], konoranoController.getKonoranoById);

// @route   POST api/konoranos
// @desc    Tạo konorano mới
// @access  Admin
router.post("/", [adminAuth, uploadLimiter, uploadFields, ...validateKonorano], konoranoController.createKonorano);

// @route   PUT api/konoranos/:id
// @desc    Cập nhật konorano
// @access  Admin
router.put("/:id", [adminAuth, uploadLimiter, ...validateObjectId, uploadFields, ...validateKonorano], konoranoController.updateKonorano);

// @route   DELETE api/konoranos/:id
// @desc    Xóa konorano
// @access  Admin
router.delete("/:id", [adminAuth, ...validateObjectId], konoranoController.deleteKonorano);

export default router;
