"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

type TestUser = {
  name: string;
  email: string;
  password: string;
  role: string;
  country: string;
};

const testUsers: TestUser[] = [
  {
    name: "Nick Fury",
    email: "nick@slooze.com",
    password: "admin123",
    role: "ADMIN",
    country: "AMERICA",
  },
  {
    name: "Captain Marvel",
    email: "marvel@slooze.com",
    password: "pass123",
    role: "MANAGER",
    country: "INDIA",
  },
  {
    name: "Captain America",
    email: "america@slooze.com",
    password: "pass123",
    role: "MANAGER",
    country: "AMERICA",
  },
  {
    name: "Thanos",
    email: "thanos@slooze.com",
    password: "pass123",
    role: "MEMBER",
    country: "INDIA",
  },
  {
    name: "Thor",
    email: "thor@slooze.com",
    password: "pass123",
    role: "MEMBER",
    country: "INDIA",
  },
  {
    name: "Travis",
    email: "travis@slooze.com",
    password: "pass123",
    role: "MEMBER",
    country: "AMERICA",
  },
];

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-600 text-white",
  MANAGER: "bg-blue-600 text-white",
  MEMBER: "bg-green-600 text-white",
};

const countryColors: Record<string, string> = {
  INDIA: "bg-orange-500 text-white",
  AMERICA: "bg-blue-500 text-white",
};

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (user: TestUser) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <div className="grid w-full max-w-5xl gap-10 md:grid-cols-[1.1fr,1fr]">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 shadow-xl">
          <h1 className="mb-2 text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mb-6 text-sm text-gray-400">
            Sign in with one of the pre-seeded users to explore role-based access
            and geo restrictions.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none ring-purple-500/40 focus:border-purple-500 focus:ring-2"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-200">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none ring-purple-500/40 focus:border-purple-500 focus:ring-2"
                placeholder="password"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Demo passwords are pre-seeded (Admin uses{" "}
                <span className="font-mono">admin123</span>, others use{" "}
                <span className="font-mono">pass123</span>).
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting || isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting || isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Test Users
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {testUsers.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="flex flex-col items-start rounded-xl border border-gray-800 bg-gray-900/70 p-4 text-left hover:border-purple-600 hover:bg-gray-900"
              >
                <div className="mb-1 text-sm font-semibold text-white">
                  {u.name}
                </div>
                <div className="mb-2 space-x-1 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${roleColors[u.role]}`}
                  >
                    {u.role}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${countryColors[u.country]}`}
                  >
                    {u.country}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">{u.email}</div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Role and country determine what restaurants, menus, and orders each user
            can see. Admins see everything; managers and members are restricted to
            their country.
          </p>
        </div>
      </div>
    </div>
  );
}

