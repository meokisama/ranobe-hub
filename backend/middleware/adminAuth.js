const jwt = require("jsonwebtoken");
const config = require("../config/config");

module.exports = function (req, res, next) {
  const adminToken = req.header("x-admin-token");

  if (!adminToken) {
    return res.status(401).json({ msg: "Không có quyền truy cập" });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(adminToken, config.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
