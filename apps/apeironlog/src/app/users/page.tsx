"use client";

import { useState, useEffect, useRef } from "react";
import { GetUsers, DeleteUser } from "../../api/User";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string | null;
}

export default function UsersPage() {
  const searchParams = useSearchParams();

  // 状态管理
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 搜索过滤
  const [searchEmail, setSearchEmail] = useState("");
  const [searchName, setSearchName] = useState("");
  const [tempSearchEmail, setTempSearchEmail] = useState("");
  const [tempSearchName, setTempSearchName] = useState("");

  // 排序
  const [sortField, setSortField] = useState<"id" | "email" | "name">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 从URL参数中获取初始状态
  useEffect(() => {
    const page = searchParams.get("page");
    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const sort = searchParams.get("sort") as "id" | "email" | "name" | null;
    const order = searchParams.get("order") as "asc" | "desc" | null;

    if (page) setCurrentPage(parseInt(page));
    if (email) {
      setSearchEmail(email);
      setTempSearchEmail(email);
    }
    if (name) {
      setSearchName(name);
      setTempSearchName(name);
    }
    if (sort) setSortField(sort);
    if (order) setSortOrder(order);
  }, [searchParams]);

  // 加载用户数据
  const loadUsers = async () => {
    setLoading(true);

    try {
      const orderBy =
        sortField === "id"
          ? { id: sortOrder }
          : sortField === "email"
            ? { email: sortOrder }
            : { name: sortOrder };
      const skip = (currentPage - 1) * pageSize;

      const result = await GetUsers({
        skip,
        take: pageSize,
        orderBy,
      });
      if (result.success) {
        setUsers(result.users || []);
        setTotalCount(result.totalCount || 0);
      }

      if (result.success) {
        setUsers(result.users || []);
        setTotalCount(result.totalCount || 0);
        setError("");
      } else {
        setError(result.error || "加载用户列表失败");
      }
    } catch (err) {
      setError("获取用户数据时发生错误");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsersRef = useRef(loadUsers);
  loadUsersRef.current = loadUsers;

  // 当依赖项变化时重新加载数据
  useEffect(() => {
    loadUsersRef.current();

    // 更新URL参数
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (searchEmail) params.set("email", searchEmail);
    if (searchName) params.set("name", searchName);
    if (sortField !== "id") params.set("sort", sortField);
    if (sortOrder !== "asc") params.set("order", sortOrder);

    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.pushState({}, "", newUrl);
  }, [currentPage, searchEmail, searchName, sortField, sortOrder]);

  // 处理搜索表单提交
  const handleSearch = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSearchEmail(tempSearchEmail);
    setSearchName(tempSearchName);
    setCurrentPage(1); // 重置到第一页
  };

  // 清除搜索条件
  const handleClearSearch = () => {
    setTempSearchEmail("");
    setTempSearchName("");
    setSearchEmail("");
    setSearchName("");
    setCurrentPage(1);
  };

  // 处理排序
  const handleSort = (field: "id" | "email" | "name") => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // 处理删除用户
  const handleDelete = async (id: number) => {
    if (!window.confirm("确定要删除此用户吗？")) return;

    try {
      const result = await DeleteUser({ id });

      if (result.success) {
        loadUsers(); // 重新加载数据
      } else {
        setError(result.error || "删除用户失败");
      }
    } catch (err) {
      setError("删除用户时发生错误");
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
  const renderSortIcon = (field: "id" | "email" | "name") => {
    if (sortField !== field) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Link
          href="/users/create"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          创建用户
        </Link>
      </div>

      {/* 搜索表单 */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label htmlFor="email" className="block text-sm mb-1">
              邮箱
            </label>
            <input
              type="text"
              id="email"
              value={tempSearchEmail}
              onChange={(e) => setTempSearchEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="搜索邮箱..."
            />
          </div>

          <div className="flex-1">
            <label htmlFor="name" className="block text-sm mb-1">
              用户名
            </label>
            <input
              type="text"
              id="name"
              value={tempSearchName}
              onChange={(e) => setTempSearchName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="搜索用户名..."
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              搜索
            </button>

            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              清除
            </button>
          </div>
        </form>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {/* 用户列表 */}
      <div className="bg-white shadow rounded overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full"></div>
            <span className="ml-2">加载中...</span>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    ID {renderSortIcon("id")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    邮箱 {renderSortIcon("email")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    用户名 {renderSortIcon("name")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      没有找到用户数据
                    </td>
                  </tr>
                ) : (
                  users.map((user: User) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/users/${user.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="px-6 py-4 border-t">{renderPagination()}</div>
          </>
        )}
      </div>
    </div>
  );
}
