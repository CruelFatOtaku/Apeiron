import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "../lib/jwt";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/login")) return NextResponse.next();

  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // 可选：校验 token 合法性
  try {
    verifyToken(token);
  } catch (e) {
    console.error("Token verification failed:", e);
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|login).*)"],
};
