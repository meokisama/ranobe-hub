const express = require("express");
const router = express.Router();
const subscriberController = require("../controllers/subscriberController");

router.post("/subscribe", subscriberController.subscribe);
router.get("/unsubscribe", subscriberController.unsubscribe);

module.exports = router;
