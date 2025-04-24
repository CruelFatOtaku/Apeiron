"use client";

import { CreateUser } from "../../../api/User";
import UserForm from "../components/UserForm";

export default function CreateUserPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">创建用户</h1>
        <p className="text-gray-500">添加一个新用户到系统</p>
      </div>

      <UserForm onSubmit={CreateUser} submitButtonText="创建用户" />
    </div>
  );
}
