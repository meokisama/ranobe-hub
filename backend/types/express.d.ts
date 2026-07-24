import type { JwtPayload } from "jsonwebtoken";

// Mở rộng Express Request để mang thông tin admin đã decode từ JWT
// (được gán trong middleware/adminAuth.ts).
declare global {
  namespace Express {
    interface Request {
      admin?: string | JwtPayload;
    }
  }
}

export {};
