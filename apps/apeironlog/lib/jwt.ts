import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "apeiron_default_secret";
const EXPIRES_IN = "7d"; // token 有效期

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    console.error("JWT 验证失败:", e);
    return null;
  }
}
