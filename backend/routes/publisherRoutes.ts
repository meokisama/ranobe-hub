import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import * as publisherController from "../controllers/publisherController.js";
import { validatePublisher, validateObjectId } from "../middleware/validation.js";

const router = express.Router();

// @route   GET api/publishers
// @desc    Get all publishers
// @access  Public
router.get("/", publisherController.getAllPublishers);

// @route   POST api/publishers
// @desc    Create publisher
// @access  Admin
router.post("/", [adminAuth, ...validatePublisher], publisherController.createPublisher);

// @route   PUT api/publishers/:id
// @desc    Update publisher
// @access  Admin
router.put("/:id", [adminAuth, ...validateObjectId, ...validatePublisher], publisherController.updatePublisher);

// @route   DELETE api/publishers/:id
// @desc    Delete publisher
// @access  Admin
router.delete("/:id", [adminAuth, ...validateObjectId], publisherController.deletePublisher);

export default router;
