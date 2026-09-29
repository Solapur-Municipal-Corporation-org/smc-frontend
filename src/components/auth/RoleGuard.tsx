"use client";
import type { Role } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";

interface RoleGuardProps {
  allow: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ allow, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
