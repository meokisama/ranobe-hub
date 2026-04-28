import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/reader";
    const MONGO_USER = process.env.MONGO_USER;
    const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

    const options = {
      ssl: process.env.MONGO_SSL === "true",
      authSource: process.env.MONGO_AUTH_SOURCE || "admin",
      retryWrites: true,
      w: "majority",
      maxPoolSize: 10, // Giới hạn kết nối tối đa
      connectTimeoutMS: 30000, // Timeout kết nối
      socketTimeoutMS: 45000, // Timeout socket
    };

    let connectionString = MONGO_URI;

    // Nếu có username và password, thêm vào connection string
    if (MONGO_USER && MONGO_PASSWORD) {
      // Xử lý connection string có chứa username và password
      if (MONGO_URI.includes("@")) {
        // Nếu URI đã có username và password, không thêm vào nữa
        connectionString = MONGO_URI;
      } else {
        // Nếu URI chưa có username và password, thêm vào
        const dbPart = MONGO_URI.replace("mongodb://", "");
        connectionString = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${dbPart}`;
      }
    }

    // Tạo kết nối với các tùy chọn an toàn
    await mongoose.connect(connectionString, options);

    console.log("MongoDB Connected Securely");

    // Đăng ký sự kiện xử lý lỗi kết nối
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export default connectDB;
