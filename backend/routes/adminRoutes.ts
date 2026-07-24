import express, { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import config from "../config/config.js";
import { loginLimiter } from "../middleware/security.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// @route   POST api/admin/login
// @desc    Đăng nhập admin
// @access  Public
router.post("/login", loginLimiter, async (req: Request, res: Response) => {
  try {
    const { password } = req.body ?? {};

    // So sánh mật khẩu đã hash
    const isMatch = await bcrypt.compare(password, config.ADMIN_PASSWORD);

    if (isMatch) {
      // Tạo JWT token
      const token = jwt.sign({ admin: true }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN as SignOptions["expiresIn"],
      });

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
router.get("/verify", adminAuth, (_req: Request, res: Response) => {
  res.json({ msg: "Token hợp lệ" });
});

export default router;
