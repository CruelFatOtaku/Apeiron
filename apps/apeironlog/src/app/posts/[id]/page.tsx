"use client";

import { useEffect, useState } from "react";
import { GetPostById } from "../../../api/Post";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

export default function PostDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      try {
        const result = await GetPostById({ id: postId, includeAuthor: true });

        if (result.success && result.post) {
          setPost(result.post);
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
  }, [postId]);

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

  if (error || !post) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error || "文章不存在"}
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push("/posts")}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            返回文章列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <div className="flex items-center text-gray-500 mt-2">
          <span
            className={`px-2 py-1 text-xs rounded-full mr-4 ${
              post.published
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {post.published ? "已发布" : "草稿"}
          </span>
          {post.author && (
            <span>
              作者：
              <Link
                href={`/users/${post.authorId}`}
                className="hover:text-blue-600 hover:underline"
              >
                {post.author.name || post.author.email}
              </Link>
            </span>
          )}
        </div>
      </div>

      <div className="bg-blue-500 shadow rounded overflow-hidden">
        <div className="p-6">
          <div className="prose max-w-none">
            {post.content ? (
              <div className="whitespace-pre-wrap">{post.content}</div>
            ) : (
              <p className="text-gray-500 italic">暂无内容</p>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t flex justify-between">
          <Link
            href="/posts"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            返回列表
          </Link>

          <div className="flex gap-2">
            <Link
              href={`/posts/${post.id}/edit`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              编辑文章
            </Link>
            {!post.published && (
              <Link
                href={`/posts/${post.id}/edit?publish=true`}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                发布文章
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
