"use server";
import prisma from "../../lib/prisma";

/**
 * 创建新文章
 * @param authorId 作者ID
 * @param title 文章标题
 * @param content 文章内容
 * @param published 是否发布
 * @returns 新创建的文章对象
 */
export async function CreatePost({
  authorId,
  title,
  content,
  published = false,
}: {
  authorId: number;
  title: string;
  content?: string;
  published?: boolean;
}) {
  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        published,
        authorId,
      },
    });

    return {
      success: true,
      post: newPost,
    };
  } catch (error) {
    console.error("创建文章失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 获取文章列表
 * @param options 查询选项
 * @param options.skip 跳过的记录数（分页用）
 * @param options.take 获取的记录数（分页用）
 * @param options.orderBy 排序方式
 * @param options.includeAuthor 是否包含作者信息
 * @param options.filter 过滤条件
 * @returns 文章列表及总数
 */
export async function GetPosts({
  skip = 0,
  take = 10,
  orderBy = { id: "desc" } as const,
  includeAuthor = false,
  filter = {},
}: {
  skip?: number;
  take?: number;
  orderBy?:
    | { id: "asc" | "desc" }
    | { title: "asc" | "desc" }
    | { published: "asc" | "desc" };
  includeAuthor?: boolean;
  filter?: {
    title?: string;
    authorId?: number;
    published?: boolean;
  };
} = {}) {
  try {
    const where = {
      ...(filter.title ? { title: { contains: filter.title } } : {}),
      ...(filter.authorId !== undefined ? { authorId: filter.authorId } : {}),
      ...(filter.published !== undefined
        ? { published: filter.published }
        : {}),
    };

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        skip,
        take,
        where,
        orderBy,
        include: includeAuthor ? { author: true } : undefined,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      success: true,
      posts,
      totalCount,
      pagination: {
        skip,
        take,
        hasMore: skip + take < totalCount,
      },
    };
  } catch (error) {
    console.error("获取文章列表失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 根据ID获取单个文章详情
 * @param id 文章ID
 * @param includeAuthor 是否包含作者信息
 * @returns 文章详情
 */
export async function GetPostById({
  id,
  includeAuthor = false,
}: {
  id: number;
  includeAuthor?: boolean;
}) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: includeAuthor ? { author: true } : undefined,
    });

    if (!post) {
      return {
        success: false,
        error: "文章不存在",
      };
    }

    return {
      success: true,
      post,
    };
  } catch (error) {
    console.error("获取文章详情失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 更新文章信息
 * @param id 文章ID
 * @param data 要更新的数据
 * @returns 更新后的文章信息
 */
export async function UpdatePost({
  id,
  data,
}: {
  id: number;
  data: {
    title?: string;
    content?: string;
    published?: boolean;
    authorId?: number;
  };
}) {
  try {
    const post = await prisma.post.update({
      where: { id },
      data,
    });

    return {
      success: true,
      post,
    };
  } catch (error) {
    console.error("更新文章失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 删除文章
 * @param id 文章ID
 * @returns 操作结果
 */
export async function DeletePost({ id }: { id: number }) {
  try {
    await prisma.post.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("删除文章失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}
