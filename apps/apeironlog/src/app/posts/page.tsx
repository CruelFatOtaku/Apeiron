"use client";

import { useState, useEffect, useRef } from "react";
import { GetPosts, DeletePost } from "../../api/Post";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Post {
  id: number;
  title: string;
  content: string | null;
  published: boolean;
  authorId: number;
  author?: {
    id: number;
    name: string | null;
    email: string;
  };
}

export default function PostsPage() {
  const searchParams = useSearchParams();

  // 状态管理
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 搜索过滤
  const [searchTitle, setSearchTitle] = useState("");
  const [tempSearchTitle, setTempSearchTitle] = useState("");
  const [filterPublished, setFilterPublished] = useState<boolean | undefined>(
    undefined
  );

  // 排序
  const [sortField, setSortField] = useState<"id" | "title" | "published">(
    "id"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // 从URL参数中获取初始状态
  useEffect(() => {
    const page = searchParams.get("page");
    const title = searchParams.get("title");
    const published = searchParams.get("published");
    const sort = searchParams.get("sort") as
      | "id"
      | "title"
      | "published"
      | null;
    const order = searchParams.get("order") as "asc" | "desc" | null;

    if (page) setCurrentPage(parseInt(page));
    if (title) {
      setSearchTitle(title);
      setTempSearchTitle(title);
    }
    if (published !== null) {
      setFilterPublished(published === "true");
    }
    if (sort) setSortField(sort);
    if (order) setSortOrder(order);
  }, [searchParams]);

  // 加载文章数据
  const loadPosts = async () => {
    setLoading(true);

    try {
      const orderBy =
        sortField === "id"
          ? { id: sortOrder }
          : sortField === "title"
            ? { title: sortOrder }
            : { published: sortOrder };
      const skip = (currentPage - 1) * pageSize;

      const result = await GetPosts({
        skip,
        take: pageSize,
        orderBy,
        includeAuthor: true,
        filter: {
          title: searchTitle || undefined,
          published: filterPublished,
        },
      });

      if (result.success) {
        setPosts(result.posts || []);
        setTotalCount(result.totalCount || 0);
        setError("");
      } else {
        setError(result.error || "加载文章列表失败");
      }
    } catch (err) {
      setError("获取文章数据时发生错误");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPostsRef = useRef(loadPosts);
  loadPostsRef.current = loadPosts;

  // 当依赖项变化时重新加载数据
  useEffect(() => {
    loadPostsRef.current();

    // 更新URL参数
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (searchTitle) params.set("title", searchTitle);
    if (filterPublished !== undefined)
      params.set("published", filterPublished.toString());
    if (sortField !== "id") params.set("sort", sortField);
    if (sortOrder !== "desc") params.set("order", sortOrder);

    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.pushState({}, "", newUrl);
  }, [currentPage, searchTitle, filterPublished, sortField, sortOrder]);

  // 处理搜索表单提交
  const handleSearch = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSearchTitle(tempSearchTitle);
    setCurrentPage(1); // 重置到第一页
  };

  // 清除搜索条件
  const handleClearSearch = () => {
    setTempSearchTitle("");
    setSearchTitle("");
    setFilterPublished(undefined);
    setCurrentPage(1);
  };

  // 处理排序
  const handleSort = (field: "id" | "title" | "published") => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // 处理删除文章
  const handleDelete = async (id: number) => {
    if (!window.confirm("确定要删除此文章吗？")) return;

    try {
      const result = await DeletePost({ id });

      if (result.success) {
        loadPosts(); // 重新加载数据
      } else {
        setError(result.error || "删除文章失败");
      }
    } catch (err) {
      setError("删除文章时发生错误");
      console.error(err);
    }
  };

  // 分页组件渲染
  const renderPagination = () => {
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
      <div className="flex items-center justify-between mt-6">
        <div>
          共 <span className="font-bold">{totalCount}</span> 条记录， 当前第{" "}
          <span className="font-bold">{currentPage}</span> / {totalPages} 页
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            上一页
          </button>

          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            下一页
          </button>
        </div>
      </div>
    );
  };

  // 排序图标
  const renderSortIcon = (field: "id" | "title" | "published") => {
    if (sortField !== field) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
        <Link
          href="/posts/create"
          className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-colors font-medium"
        >
          创建文章
        </Link>
      </div>

      {/* 搜索表单 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label htmlFor="title" className="block text-sm text-gray-700 mb-1">
              标题
            </label>
            <input
              type="text"
              id="title"
              value={tempSearchTitle}
              onChange={(e) => setTempSearchTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="搜索标题..."
            />
          </div>

          <div className="w-48">
            <label
              htmlFor="published"
              className="block text-sm text-gray-700 mb-1"
            >
              状态
            </label>
            <select
              id="published"
              value={
                filterPublished === undefined ? "" : filterPublished.toString()
              }
              onChange={(e) => {
                const val = e.target.value;
                setFilterPublished(val === "" ? undefined : val === "true");
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">全部</option>
              <option value="true">已发布</option>
              <option value="false">未发布</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-colors font-medium"
            >
              搜索
            </button>

            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              清除
            </button>
          </div>
        </form>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* 文章列表 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("id")}
                  >
                    ID {renderSortIcon("id")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("title")}
                  >
                    标题 {renderSortIcon("title")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作者
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort("published")}
                  >
                    状态 {renderSortIcon("published")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      没有找到文章数据
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {post.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <Link
                          href={`/posts/${post.id}`}
                          className="text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.author ? (
                          <Link
                            href={`/users/${post.authorId}`}
                            className="text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            {post.author.name || post.author.email}
                          </Link>
                        ) : (
                          `用户 #${post.authorId}`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            post.published
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {post.published ? "已发布" : "草稿"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/posts/${post.id}/edit`}
                          className="text-indigo-700 hover:text-indigo-800 font-medium mr-4"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-700 hover:text-red-800 font-medium"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="px-6 py-4 bg-gray-50 border-t">
              {renderPagination()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
