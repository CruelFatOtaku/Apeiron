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
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-red-600 mb-4">{error || "文章不存在"}</div>
          <button
            onClick={() => router.push("/posts")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            返回文章列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              post.published
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {post.published ? "已发布" : "草稿"}
          </span>
        </div>

        {post.author && (
          <div className="flex items-center space-x-2 text-gray-600 mb-4">
            <span>作者：</span>
            <Link
              href={`/users/${post.authorId}`}
              className="text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              {post.author.name || post.author.email}
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="prose max-w-none">
            {post.content ? (
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            ) : (
              <p className="text-gray-500 italic">暂无内容</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
          <Link
            href="/posts"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            返回列表
          </Link>

          <div className="flex gap-3">
            <Link
              href={`/posts/${post.id}/edit`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              编辑文章
            </Link>
            {!post.published && (
              <Link
                href={`/posts/${post.id}/edit?publish=true`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
