import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import config from "../config/config.js";

export default function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const adminToken = req.header("x-admin-token");

  if (!adminToken) {
    res.status(401).json({ msg: "Không có quyền truy cập" });
    return;
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(adminToken, config.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Token không hợp lệ hoặc đã hết hạn" });
  }
}
