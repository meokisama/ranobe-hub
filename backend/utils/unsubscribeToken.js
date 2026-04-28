const jwt = require("jsonwebtoken");
const config = require("../config/config");

const PURPOSE = "unsubscribe";

function signUnsubscribeToken(email) {
  return jwt.sign({ email, purpose: PURPOSE }, config.JWT_SECRET);
}

function verifyUnsubscribeToken(token) {
  const decoded = jwt.verify(token, config.JWT_SECRET);
  if (decoded.purpose !== PURPOSE || !decoded.email) {
    throw new Error("Invalid unsubscribe token");
  }
  return decoded.email;
}

module.exports = { signUnsubscribeToken, verifyUnsubscribeToken };
