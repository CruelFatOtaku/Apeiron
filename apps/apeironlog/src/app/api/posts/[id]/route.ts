import { GetPostById } from "../../../../api/Post";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的文章ID" }, { status: 400 });
    }

    // 从URL中获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const includeAuthor = searchParams.get("includeAuthor") === "true";

    const result = await GetPostById({
      id,
      includeAuthor,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "获取文章失败" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API路由错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
}
