const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const publisherController = require("../controllers/publisherController");
const { validatePublisher, validateObjectId } = require("../middleware/validation");

// @route   GET api/publishers
// @desc    Lấy tất cả nhãn hiệu
// @access  Public
router.get("/", publisherController.getAllPublishers);

// @route   POST api/publishers
// @desc    Tạo nhãn hiệu mới
// @access  Admin
router.post("/", [adminAuth, validatePublisher], publisherController.createPublisher);

// @route   PUT api/publishers/:id
// @desc    Cập nhật nhãn hiệu
// @access  Admin
router.put("/:id", [adminAuth, validateObjectId, validatePublisher], publisherController.updatePublisher);

// @route   DELETE api/publishers/:id
// @desc    Xóa nhãn hiệu
// @access  Admin
router.delete("/:id", [adminAuth, validateObjectId], publisherController.deletePublisher);

module.exports = router;
