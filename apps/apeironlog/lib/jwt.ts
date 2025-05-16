import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "apeiron_default_secret";
const EXPIRES_IN = "7d"; // token 有效期

function getSecretKey() {
  // jose 需要 Uint8Array 类型的密钥
  return new TextEncoder().encode(JWT_SECRET);
}

export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(EXPIRES_IN)
    .sign(getSecretKey());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload;
}
