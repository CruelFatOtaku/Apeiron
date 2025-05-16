"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useFloating,
  offset,
  flip,
  shift,
  useHover,
  useDismiss,
  useInteractions,
  safePolygon,
} from "@floating-ui/react-dom-interactions";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Not logged in");
  return res.json();
};

async function logout() {
  try {
    const res = await fetch("/api/logout", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Logout failed");
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

export default function UserNav() {
  // 用 swr 获取用户信息
  const { data: user, isLoading, mutate } = useSWR("/api/user", fetcher);
  const [showPopover, setShowPopover] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  // floating-ui hooks
  const { x, y, reference, floating, strategy, context } = useFloating({
    open: showPopover,
    onOpenChange: setShowPopover,
    middleware: [offset(8), flip(), shift()],
    placement: "bottom-end",
  });
  const hover = useHover(context, { handleClose: safePolygon() });
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    dismiss,
  ]);

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    logout().then((success) => {
      if (success) {
        mutate(null, false); // 清空 swr 缓存
        router.replace("/login");
      }
    });
    setShowLogoutModal(false);
    mutate(null, false);
    router.replace("/login");
  };
  const cancelLogout = () => setShowLogoutModal(false);

  return (
    <>
      {user ? (
        <div className="relative ml-6">
          <button
            ref={reference}
            {...getReferenceProps({
              className:
                "flex items-center space-x-2 px-3 py-2 rounded hover:bg-gray-100 focus:outline-none",
              onClick: () => setShowPopover((v) => !v),
            })}
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
              ref={floating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                zIndex: 50,
                width: 224, // w-56
              }}
              {...getFloatingProps({
                className: "bg-white border rounded-lg shadow-lg p-4",
              })}
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
      ) : isLoading ? null : (
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
