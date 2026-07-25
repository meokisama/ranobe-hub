import mongoose, { type ConnectOptions } from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/reader";
    const MONGO_USER = process.env.MONGO_USER;
    const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

    const options: ConnectOptions = {
      ssl: process.env.MONGO_SSL === "true",
      authSource: process.env.MONGO_AUTH_SOURCE || "admin",
      retryWrites: true,
      w: "majority",
      maxPoolSize: 10,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    let connectionString = MONGO_URI;

    // Inject credentials into the connection string when provided
    if (MONGO_USER && MONGO_PASSWORD) {
      if (MONGO_URI.includes("@")) {
        // URI already embeds credentials; leave as-is
        connectionString = MONGO_URI;
      } else {
        const dbPart = MONGO_URI.replace("mongodb://", "");
        connectionString = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${dbPart}`;
      }
    }

    await mongoose.connect(connectionString, options);

    console.log("MongoDB Connected Securely");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err instanceof Error ? err.message : err);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export default connectDB;
