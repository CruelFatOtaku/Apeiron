"use client";

import { useEffect, useState } from "react";
import { GetPostById, UpdatePost } from "../../../../api/Post";
import PostForm from "../../components/PostForm";
import { useParams, useSearchParams } from "next/navigation";

export default function EditPostPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const postId = Number(params.id);
  const shouldPublish = searchParams.get("publish") === "true";

  const [post, setPost] = useState<{
    id: number;
    title: string;
    content: string | null;
    published: boolean;
    authorId: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      try {
        const result = await GetPostById({ id: postId });

        if (result.success) {
          const loadedPost = result.post;
          // 如果URL中包含publish=true参数，则默认设置为发布状态
          if (shouldPublish && !loadedPost.published) {
            loadedPost.published = true;
          }
          setPost(loadedPost);
          setError("");
        } else {
          setError(result.error || "加载文章信息失败");
        }
      } catch (err) {
        setError("获取文章数据时发生错误");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, shouldPublish]);

  const handleUpdate = async (data: {
    title: string;
    content?: string;
    published: boolean;
    authorId: number;
  }) => {
    return await UpdatePost({
      id: postId,
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
        <h1 className="text-2xl font-bold">编辑文章</h1>
        <p className="text-gray-500">
          {shouldPublish ? "发布并编辑文章" : "修改文章内容"}
        </p>
      </div>

      {post && (
        <PostForm
          initialData={{
            id: post.id,
            title: post.title,
            content: post.content || "",
            published: post.published,
            authorId: post.authorId,
          }}
          onSubmit={handleUpdate}
          submitButtonText="保存修改"
        />
      )}
    </div>
  );
}
