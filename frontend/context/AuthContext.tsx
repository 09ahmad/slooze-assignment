"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";

type Role = "ADMIN" | "MANAGER" | "MEMBER";
type Country = "INDIA" | "AMERICA";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  country: Country;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const applyAuthSideEffects = (newToken: string | null, newUser?: AuthUser) => {
    if (typeof window === "undefined") return;

    if (newToken) {
      window.localStorage.setItem("token", newToken);
      document.cookie = `token=${newToken}; path=/`;
    } else {
      window.localStorage.removeItem("token");
      document.cookie = "token=; Max-Age=0; path=/";
    }

    if (newUser) {
      document.cookie = `role=${newUser.role}; path=/`;
    } else {
      document.cookie = "role=; Max-Age=0; path=/";
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token: jwt, user: loggedInUser } = res.data as {
        token: string;
        user: AuthUser;
      };
      setToken(jwt);
      setUser(loggedInUser);
      applyAuthSideEffects(jwt, loggedInUser);
      router.replace("/restaurants");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    applyAuthSideEffects(null);
    router.replace("/login");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = window.localStorage.getItem("token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    api
      .post("/auth/me")
      .then((res) => {
        const currentUser = res.data as AuthUser;
        setUser(currentUser);
        applyAuthSideEffects(storedToken, currentUser);
      })
      .catch(() => {
        applyAuthSideEffects(null);
        setUser(null);
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

