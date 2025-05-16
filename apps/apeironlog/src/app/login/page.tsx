"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../api/User";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await loginUser({ email, password });
    if (res.success && res.token) {
      // 保存 token 到 localStorage
      localStorage.setItem("token", res.token);
      router.replace("/");
    } else {
      setError(res.error || "登录失败");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">登录</h2>
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          登录
        </button>
      </form>
    </div>
  );
}
