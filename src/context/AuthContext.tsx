"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import type { Role } from "@/types/auth";

interface AuthUser {
  id: string;
  name: string;
  role: Role;
  departmentId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = Cookies.get("smc_token");
    if (stored) {
      try {
        const decoded = jwtDecode<AuthUser>(stored);
        setUser(decoded);
        setToken(stored);
      } catch {
        Cookies.remove("smc_token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    Cookies.set("smc_token", newToken, { expires: 1, secure: true, sameSite: "strict" });
    const decoded = jwtDecode<AuthUser>(newToken);
    setUser(decoded);
    setToken(newToken);
  };

  const logout = () => {
    Cookies.remove("smc_token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
