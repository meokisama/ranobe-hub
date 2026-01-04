const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { loginLimiter } = require("../middleware/security");
const adminAuth = require("../middleware/adminAuth");

// @route   GET api/admin/csrf-token
// @desc    Lấy CSRF token
// @access  Public
router.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// @route   POST api/admin/login
// @desc    Đăng nhập admin
// @access  Public
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { password } = req.body;

    // So sánh mật khẩu đã hash
    const isMatch = await bcrypt.compare(password, config.ADMIN_PASSWORD);

    if (isMatch) {
      // Tạo JWT token
      const token = jwt.sign({ admin: true }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

      res.json({
        token,
        expiresIn: config.JWT_EXPIRES_IN,
      });
    } else {
      res.status(401).json({ msg: "Mật khẩu không đúng" });
    }
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

// @route   GET api/admin/verify
// @desc    Verify admin token
// @access  Admin
router.get("/verify", adminAuth, (req, res) => {
  res.json({ msg: "Token hợp lệ" });
});

module.exports = router;
