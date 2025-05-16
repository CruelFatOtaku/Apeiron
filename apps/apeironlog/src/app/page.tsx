"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GetUsers } from "../api/User";
import { GetPosts } from "../api/Post";

type Users = Awaited<ReturnType<typeof GetUsers>>["users"];
type Posts = Awaited<ReturnType<typeof GetPosts>>["posts"];

// infer Item type from array
type PickItem<T> = T extends (infer Item)[] ? Item : never;
type UserItem = PickItem<Users>;
type PostItem = PickItem<Posts>;

export default function Home() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersRes = await GetUsers({ includePost: true });
        const postsRes = await GetPosts();
        setUsers(usersRes.users || []);
        setPosts(postsRes.posts || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setUsers([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span>加载中...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Featured Users Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Featured Writers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {users?.map((user) => (
            <Link
              href={`/users/${user.id}`}
              key={user.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name || user.email}
                  </h3>
                  <p className="text-gray-600">{user.name || "用户"}</p>
                  <p className="text-sm text-gray-500">
                    {(user.posts?.length ?? 0) + " posts"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Posts Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts?.map((post) => (
            <Link
              href={`/posts/${post.id}`}
              key={post.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-indigo-600">
                    {post.title || "无标题"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {post.published || "未发布"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {post.content?.slice(0, 60) + "..."}
                </p>
                <div className="flex items-center justify-between"></div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
