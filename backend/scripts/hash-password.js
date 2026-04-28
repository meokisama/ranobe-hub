import bcrypt from "bcryptjs";

async function changeAdminPassword(newPassword) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log("Mật khẩu mới đã được hash:");
    console.log(hashedPassword);
    console.log("\nBạn cần copy hash này và cập nhật vào .env");
  } catch (err) {
    console.error("Lỗi khi hash mật khẩu:", err);
  }
}

// Lấy mật khẩu mới từ tham số dòng lệnh
const newPassword = process.argv[2];
if (!newPassword) {
  console.error("Vui lòng nhập mật khẩu mới");
  console.log('Cách sử dụng: node hash-password.js "mật-khẩu-mới"');
  process.exit(1);
}

changeAdminPassword(newPassword);
