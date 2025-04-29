import Link from "next/link";

// Mock data for demonstration
const users = [
  {
    id: 1,
    name: "John Doe",
    avatar: "/avatars/user1.jpg",
    role: "Writer",
    posts: 12,
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "/avatars/user2.jpg",
    role: "Editor",
    posts: 8,
  },
  {
    id: 3,
    name: "Mike Johnson",
    avatar: "/avatars/user3.jpg",
    role: "Contributor",
    posts: 5,
  },
];

const posts = [
  {
    id: 1,
    title: "Getting Started with Next.js",
    excerpt: "Learn how to build modern web applications with Next.js...",
    author: "John Doe",
    date: "2024-04-28",
    readTime: "5 min read",
    category: "Development",
  },
  {
    id: 2,
    title: "The Future of Web Development",
    excerpt:
      "Exploring the latest trends and technologies in web development...",
    author: "Jane Smith",
    date: "2024-04-27",
    readTime: "8 min read",
    category: "Technology",
  },
  {
    id: 3,
    title: "Best Practices for React Development",
    excerpt: "Essential tips and tricks for writing better React code...",
    author: "Mike Johnson",
    date: "2024-04-26",
    readTime: "6 min read",
    category: "Development",
  },
];

export default function Home() {
  return (
    <div>
      {/* Featured Users Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Featured Writers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {users.map((user) => (
            <Link
              href={`/users/${user.id}`}
              key={user.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-gray-600">{user.role}</p>
                  <p className="text-sm text-gray-500">{user.posts} posts</p>
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
          {posts.map((post) => (
            <Link
              href={`/posts/${post.id}`}
              key={post.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-indigo-600">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{post.author}</span>
                  <span className="text-sm text-gray-500">{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
