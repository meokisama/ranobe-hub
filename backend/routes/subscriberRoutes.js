const express = require("express");
const router = express.Router();
const subscriberController = require("../controllers/subscriberController");
const { validateSubscriber, validateUnsubscribeToken } = require("../middleware/validation");

// @route   POST api/subscribers/subscribe
// @desc    Đăng ký nhận tin
// @access  Public
router.post("/subscribe", validateSubscriber, subscriberController.subscribe);

// @route   GET api/subscribers/unsubscribe
// @desc    Hủy đăng ký
// @access  Public
router.get("/unsubscribe", validateUnsubscribeToken, subscriberController.unsubscribe);

module.exports = router;
