"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserNav() {
  const [user, setUser] = useState<{ name?: string; email: string } | null>(
    null
  );
  const [showPopover, setShowPopover] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUser({ name: payload.name, email: payload.email });
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    localStorage.removeItem("token");
    setShowLogoutModal(false);
    setUser(null);
    router.replace("/login");
  };
  const cancelLogout = () => setShowLogoutModal(false);

  return (
    <>
      {user ? (
        <div className="relative ml-6">
          <button
            className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-gray-100 focus:outline-none"
            onMouseEnter={() => setShowPopover(true)}
            onMouseLeave={() => setShowPopover(false)}
            onClick={() => setShowPopover((v) => !v)}
          >
            <span className="font-semibold text-gray-800">
              {user.name || user.email}
            </span>
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showPopover && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 p-4"
              onMouseEnter={() => setShowPopover(true)}
              onMouseLeave={() => setShowPopover(false)}
            >
              <div className="mb-2">
                <div className="font-bold text-lg">
                  {user.name || "未命名用户"}
                </div>
                <div className="text-gray-500 text-sm">{user.email}</div>
              </div>
              <button
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 mt-2"
                onClick={handleLogout}
              >
                退出登录
              </button>
            </div>
          )}
        </div>
      ) : (
        <a
          href="/login"
          className="ml-6 text-indigo-600 font-semibold hover:underline"
        >
          登录
        </a>
      )}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-80">
            <div className="text-lg font-bold mb-4">确定要退出登录吗？</div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={cancelLogout}
              >
                取消
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={confirmLogout}
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
