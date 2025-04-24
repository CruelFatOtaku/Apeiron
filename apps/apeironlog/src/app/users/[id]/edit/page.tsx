"use client";

import { useEffect, useState } from "react";
import { GetUserById, UpdateUser } from "../../../../api/User";
import UserForm from "../../components/UserForm";
import { useParams } from "next/navigation";

export default function EditUserPage() {
  const params = useParams();
  const userId = Number(params.id);

  const [user, setUser] = useState<{
    id: number;
    email: string;
    name?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await GetUserById({ id: userId });

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

  const handleUpdate = async (data: { email: string; name?: string }) => {
    return await UpdateUser({
      id: userId,
      data,
    });
  };

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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">编辑用户</h1>
        <p className="text-gray-500">修改用户 #{userId} 的信息</p>
      </div>

      {user && (
        <UserForm
          initialData={user}
          onSubmit={handleUpdate}
          submitButtonText="保存修改"
        />
      )}
    </div>
  );
}
