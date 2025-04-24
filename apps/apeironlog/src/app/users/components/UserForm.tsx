"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface UserFormProps {
  initialData?: {
    id?: number;
    email?: string;
    name?: string;
  };
  onSubmit: (data: { email: string; name?: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  submitButtonText: string;
}

export default function UserForm({
  initialData,
  onSubmit,
  submitButtonText,
}: UserFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialData?.email || "");
  const [name, setName] = useState(initialData?.name || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 简单验证
    if (!email || !email.trim()) {
      setError("邮箱不能为空");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await onSubmit({
        email: email.trim(),
        name: name.trim() || undefined,
      });

      if (result.success) {
        router.push("/users");
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
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          邮箱 <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="请输入邮箱"
          required
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          用户名
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="请输入用户名"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/users")}
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
