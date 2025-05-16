"use server";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "../../lib/jwt";
import { cookies } from "next/headers";

/**
 * 创建新用户（注册）
 * @param email 用户邮箱（必填且唯一）
 * @param name 用户名称（可选）
 * @param password 明文密码（必填）
 * @returns 新创建的用户对象
 */
export async function CreateUser({
  email,
  name,
  password,
}: {
  email: string;
  name?: string;
  password: string;
}) {
  try {
    const hash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hash,
      },
    });
    // 返回不含密码的用户信息
    const { password: _, ...userWithoutPassword } = newUser;
    console.log(_);
    return {
      success: true,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("创建用户失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 获取用户列表
 * @param options 查询选项
 * @param options.skip 跳过的记录数（分页用）
 * @param options.take 获取的记录数（分页用）
 * @param options.orderBy 排序方式
 * @param options.includePost 是否包含用户的文章
 * @param options.filter 过滤条件
 * @returns 用户列表及总数
 */
export async function GetUsers({
  skip = 0,
  take = 10,
  orderBy = { id: "asc" } as const,
  includePost = false,
  filter = {},
}: {
  skip?: number;
  take?: number;
  orderBy?:
    | { id: "asc" | "desc" }
    | { email: "asc" | "desc" }
    | { name: "asc" | "desc" };
  includePost?: boolean;
  filter?: {
    email?: string;
    name?: string;
  };
} = {}) {
  try {
    const where = {
      ...(filter.email ? { email: { contains: filter.email } } : {}),
      ...(filter.name ? { name: { contains: filter.name } } : {}),
    };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany<{
        skip: number;
        take: number;
        where: {
          email?: { contains: string };
          name?: { contains: string };
        };
        orderBy:
          | { id: "asc" | "desc" }
          | { email: "asc" | "desc" }
          | { name: "asc" | "desc" };
        include: {
          posts?: true;
        };
      }>({
        skip,
        take,
        where,
        orderBy,
        include: includePost ? { posts: true } : { posts: undefined },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      users,
      totalCount,
      pagination: {
        skip,
        take,
        hasMore: skip + take < totalCount,
      },
    };
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 根据ID获取单个用户详情
 * @param id 用户ID
 * @param includePost 是否包含文章
 * @returns 用户详情
 */
export async function GetUserById({
  id,
  includePost = false,
}: {
  id: number;
  includePost?: boolean;
}) {
  try {
    const user = await prisma.user.findUnique<{
      where: { id: number };
      include: { posts?: true };
    }>({
      where: { id },
      include: includePost ? { posts: true } : { posts: undefined },
    });

    if (!user) {
      return {
        success: false,
        error: "用户不存在",
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("获取用户详情失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 更新用户信息
 * @param id 用户ID
 * @param data 要更新的数据
 * @returns 更新后的用户信息
 */
export async function UpdateUser({
  id,
  data,
}: {
  id: number;
  data: { email?: string; name?: string };
}) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("更新用户失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 删除用户
 * @param id 用户ID
 * @returns 操作结果
 */
export async function DeleteUser({ id }: { id: number }) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("删除用户失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}

/**
 * 用户登录
 * @param email 用户邮箱
 * @param password 明文密码
 * @returns 登录结果
 */
export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return { success: false, error: "用户不存在或未设置密码" };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: "密码错误" };
    }
    // 登录成功，生成 token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    // 设置 token 到 cookie
    (
      await // 设置 token 到 cookie
      cookies()
    ).set("token", token, { path: "/", httpOnly: false });
    const { password: _, ...userWithoutPassword } = user;
    console.log(_);
    return { success: true, user: userWithoutPassword, token };
  } catch (error) {
    console.error("用户登录失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
}
