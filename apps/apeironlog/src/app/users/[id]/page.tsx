"use client";

import { useEffect, useState } from "react";
import { GetUserById } from "../../../api/User";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "../../../../generated/prisma";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await GetUserById({ id: userId, includePost: true });

        if (result.success) {
          setUser(result.user);
          setError("");
        } else {
          setError(result.error || "加载用户信息失败");
        }
      } catch (err) {
        setError("获取用户数据时发生错误");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full"></div>
          <span className="ml-2">加载中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
        <div className="mt-4">
          <button
            onClick={() => router.push("/users")}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            返回用户列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">用户详情</h1>
        <p className="text-gray-500">查看用户 #{userId} 的详细信息</p>
      </div>

      {user && (
        <div className="bg-white shadow rounded overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">基本信息</h2>
                <dl>
                  <div className="grid grid-cols-3 py-2 border-b">
                    <dt className="text-gray-500">ID</dt>
                    <dd className="col-span-2">{user.id}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2 border-b">
                    <dt className="text-gray-500">邮箱</dt>
                    <dd className="col-span-2">{user.email}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2 border-b">
                    <dt className="text-gray-500">用户名</dt>
                    <dd className="col-span-2">{user.name || "-"}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">文章统计</h2>
                <dl>
                  <div className="grid grid-cols-3 py-2 border-b">
                    <dt className="text-gray-500">文章数量</dt>
                    <dd className="col-span-2">{user.posts?.length || 0}</dd>
                  </div>
                  <div className="grid grid-cols-3 py-2 border-b">
                    <dt className="text-gray-500">已发布</dt>
                    <dd className="col-span-2">
                      {user.posts?.filter((p) => p.published).length || 0}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 py-2 border-b">
                    <dt className="text-gray-500">未发布</dt>
                    <dd className="col-span-2">
                      {user.posts?.filter((p) => !p.published).length || 0}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {user.posts && user.posts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">用户文章</h2>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        标题
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.posts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {post.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              post.published
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {post.published ? "已发布" : "草稿"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t flex justify-between">
            <Link
              href="/users"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              返回列表
            </Link>

            <Link
              href={`/users/${user.id}/edit`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              编辑用户
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
