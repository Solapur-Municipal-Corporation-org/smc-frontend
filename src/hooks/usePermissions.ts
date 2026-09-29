"use client";
import { useAuth } from "@/context/AuthContext";
import { canAccessDepartmentPortal, canManageMasters, isSuperAdmin } from "@/lib/permissions";

export function usePermissions() {
  const { user } = useAuth();
  return {
    canAccessDepartmentPortal: canAccessDepartmentPortal(user?.role),
    canManageMasters: canManageMasters(user?.role),
    isSuperAdmin: isSuperAdmin(user?.role),
  };
}
