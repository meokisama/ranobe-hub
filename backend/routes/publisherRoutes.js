const express = require("express");
const router = express.Router();
const publisherController = require("../controllers/publisherController");

// Lấy tất cả nhãn hiệu
router.get("/", publisherController.getAllPublishers);

// Tạo nhãn hiệu mới
router.post("/", publisherController.createPublisher);

// Cập nhật nhãn hiệu
router.put("/:id", publisherController.updatePublisher);

// Xóa nhãn hiệu
router.delete("/:id", publisherController.deletePublisher);

module.exports = router;
