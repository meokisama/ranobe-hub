import jwt from "jsonwebtoken";
import config from "../config/config.js";

const PURPOSE = "unsubscribe";

export function signUnsubscribeToken(email) {
  return jwt.sign({ email, purpose: PURPOSE }, config.JWT_SECRET);
}

export function verifyUnsubscribeToken(token) {
  const decoded = jwt.verify(token, config.JWT_SECRET);
  if (decoded.purpose !== PURPOSE || !decoded.email) {
    throw new Error("Invalid unsubscribe token");
  }
  return decoded.email;
}
