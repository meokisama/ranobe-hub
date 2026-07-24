import express from "express";
import * as subscriberController from "../controllers/subscriberController.js";
import { validateSubscriber, validateUnsubscribeToken } from "../middleware/validation.js";

const router = express.Router();

// @route   POST api/subscribers/subscribe
// @desc    Đăng ký nhận tin
// @access  Public
router.post("/subscribe", validateSubscriber, subscriberController.subscribe);

// @route   GET api/subscribers/unsubscribe
// @desc    Hủy đăng ký
// @access  Public
router.get("/unsubscribe", validateUnsubscribeToken, subscriberController.unsubscribe);

export default router;
