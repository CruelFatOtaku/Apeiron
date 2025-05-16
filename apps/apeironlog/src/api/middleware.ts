import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/../lib/jwt";

/**
 * 用于 Next.js API 路由的 token 校验中间件
 * 用法：在 API handler 前调用，校验失败直接返回 401
 */
export function withAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json(
        { success: false, error: "未提供 token" },
        { status: 401 }
      );
    }
    const payload = verifyToken(token);
    if (!payload || typeof payload !== "object" || !("userId" in payload)) {
      return NextResponse.json(
        { success: false, error: "无效或过期的 token" },
        { status: 401 }
      );
    }
    // 可将用户信息挂载到 req 上，便于 handler 使用
    (req as any).user = payload;
    return handler(req, ...args);
  };
}
