import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/config.js";

const PURPOSE = "unsubscribe";

interface UnsubscribeTokenPayload extends JwtPayload {
  email: string;
  purpose: string;
}

export function signUnsubscribeToken(email: string): string {
  return jwt.sign({ email, purpose: PURPOSE }, config.JWT_SECRET);
}

export function verifyUnsubscribeToken(token: string): string {
  const decoded = jwt.verify(token, config.JWT_SECRET) as UnsubscribeTokenPayload;
  if (decoded.purpose !== PURPOSE || !decoded.email) {
    throw new Error("Invalid unsubscribe token");
  }
  return decoded.email;
}
