import { NextResponse } from "next/server";

// 清除cookie,并路由到/login
export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete("token");
  return res;
}
