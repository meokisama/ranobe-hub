import type { JwtPayload } from "jsonwebtoken";

// Augment Express Request to carry admin info decoded from the JWT
// (set in middleware/adminAuth.ts).
declare global {
  namespace Express {
    interface Request {
      admin?: string | JwtPayload;
    }
  }
}

export {};
