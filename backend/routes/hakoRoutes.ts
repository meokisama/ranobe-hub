import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import * as hakoController from "../controllers/hakoController.js";
import { cache } from "../middleware/cache.js";
import { validateHako, validateObjectId, validatePagination } from "../middleware/validation.js";

const router = express.Router();

// @route   GET api/hakos
// @desc    Get all hakos (paginated + search)
// @access  Public
router.get("/", [...validatePagination, cache(300)], hakoController.getAllHakos);

// @route   GET api/hakos/by-hako-id/:hakoId
// @desc    Get hako by hakoId (original id from data.json)
// @access  Public
router.get("/by-hako-id/:hakoId", cache(600), hakoController.getHakoByHakoId);

// @route   GET api/hakos/:id
// @desc    Get hako by Mongo _id
// @access  Public
router.get("/:id", [...validateObjectId, cache(600)], hakoController.getHakoById);

// @route   POST api/hakos
// @desc    Create hako
// @access  Admin
router.post("/", [adminAuth, ...validateHako], hakoController.createHako);

// @route   PUT api/hakos/:id
// @desc    Update hako
// @access  Admin
router.put("/:id", [adminAuth, ...validateObjectId, ...validateHako], hakoController.updateHako);

// @route   DELETE api/hakos/:id
// @desc    Delete hako
// @access  Admin
router.delete("/:id", [adminAuth, ...validateObjectId], hakoController.deleteHako);

export default router;
