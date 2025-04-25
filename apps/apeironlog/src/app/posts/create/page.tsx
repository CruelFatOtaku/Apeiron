"use client";

import { CreatePost } from "../../../api/Post";
import PostForm from "../components/PostForm";

export default function CreatePostPage() {
  const handleCreate = async (data: {
    title: string;
    content?: string;
    published: boolean;
    authorId: number;
  }) => {
    return await CreatePost(data);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">创建新文章</h1>
        <p className="text-gray-500">请填写下面的表单来创建新文章</p>
      </div>

      <PostForm onSubmit={handleCreate} submitButtonText="创建文章" />
    </div>
  );
}
