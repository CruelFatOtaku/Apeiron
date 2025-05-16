import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "../../../../lib/jwt";

// /api/user
export async function GET(req: NextRequest) {
  // 从 cookie 获取 token
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  try {
    const payload = (await verifyToken(token)) as unknown as {
      name: string;
      email: string;
      userId: string;
    };
    console.log(payload);

    // 只返回必要的用户信息
    return NextResponse.json({
      name: payload?.name,
      email: payload?.email,
      userId: payload?.userId,
    });
  } catch {
    return NextResponse.json({ error: "无效 token" }, { status: 401 });
  }
}
