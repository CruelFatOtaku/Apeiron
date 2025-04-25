"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GetUsers } from "../../../api/User";

interface PostFormProps {
  initialData?: {
    id?: number;
    title?: string;
    content?: string;
    published?: boolean;
    authorId?: number;
  };
  onSubmit: (data: {
    title: string;
    content?: string;
    published: boolean;
    authorId: number;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  submitButtonText: string;
}

export default function PostForm({
  initialData,
  onSubmit,
  submitButtonText,
}: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [published, setPublished] = useState(initialData?.published || false);
  const [authorId, setAuthorId] = useState<number | undefined>(
    initialData?.authorId
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<
    { id: number; email: string; name?: string | null }[]
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // 加载用户列表供选择
  useEffect(() => {
    async function loadUsers() {
      try {
        const result = await GetUsers({ take: 100 });
        if (result.success) {
          setUsers(result.users || []);
        }
      } catch (err) {
        console.error("加载用户列表失败:", err);
      } finally {
        setLoadingUsers(false);
      }
    }

    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 简单验证
    if (!title || !title.trim()) {
      setError("标题不能为空");
      return;
    }

    if (!authorId) {
      setError("请选择作者");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await onSubmit({
        title: title.trim(),
        content: content.trim() || undefined,
        published,
        authorId,
      });

      if (result.success) {
        router.push("/posts");
      } else {
        setError(result.error || "提交失败");
      }
    } catch (err) {
      setError("操作过程中发生错误");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          标题 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="请输入文章标题"
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          内容
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="请输入文章内容"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="author"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          作者 <span className="text-red-500">*</span>
        </label>
        <select
          id="author"
          value={authorId || ""}
          onChange={(e) => setAuthorId(Number(e.target.value))}
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={loadingUsers || Boolean(initialData?.id)}
        >
          <option value="">请选择作者</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name || user.email}
            </option>
          ))}
        </select>
        {loadingUsers && (
          <p className="text-sm text-gray-500 mt-1">加载用户列表中...</p>
        )}
      </div>

      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">发布文章</span>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/posts")}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          取消
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              处理中...
            </>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
}
