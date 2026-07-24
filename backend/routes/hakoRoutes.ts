import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import * as hakoController from "../controllers/hakoController.js";
import { cache } from "../middleware/cache.js";
import { validateHako, validateObjectId, validatePagination } from "../middleware/validation.js";

const router = express.Router();

// @route   GET api/hakos
// @desc    Lấy tất cả hako (với pagination + search)
// @access  Public
router.get("/", [...validatePagination, cache(300)], hakoController.getAllHakos);

// @route   GET api/hakos/by-hako-id/:hakoId
// @desc    Lấy hako theo hakoId (id gốc từ data.json)
// @access  Public
router.get("/by-hako-id/:hakoId", cache(600), hakoController.getHakoByHakoId);

// @route   GET api/hakos/:id
// @desc    Lấy hako theo _id Mongo
// @access  Public
router.get("/:id", [...validateObjectId, cache(600)], hakoController.getHakoById);

// @route   POST api/hakos
// @desc    Tạo hako mới
// @access  Admin
router.post("/", [adminAuth, ...validateHako], hakoController.createHako);

// @route   PUT api/hakos/:id
// @desc    Cập nhật hako
// @access  Admin
router.put("/:id", [adminAuth, ...validateObjectId, ...validateHako], hakoController.updateHako);

// @route   DELETE api/hakos/:id
// @desc    Xóa hako
// @access  Admin
router.delete("/:id", [adminAuth, ...validateObjectId], hakoController.deleteHako);

export default router;
