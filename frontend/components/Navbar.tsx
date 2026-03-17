"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-600 text-white",
  MANAGER: "bg-blue-600 text-white",
  MEMBER: "bg-green-600 text-white",
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="sticky top-0 z-20 border-b border-gray-800 bg-gray-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold text-white">Slooze Food</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="/restaurants"
              className={
                pathname.startsWith("/restaurants")
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              }
            >
              Restaurants
            </Link>
            <Link
              href="/orders"
              className={
                pathname.startsWith("/orders")
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              }
            >
              My Orders
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                href="/payment"
                className={
                  pathname.startsWith("/payment")
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }
              >
                Payment Methods
              </Link>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <div className="font-semibold text-white">{user.name}</div>
                <div className="text-gray-400">{user.country}</div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${roleColors[user.role]}`}
              >
                {user.role}
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-red-500 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

