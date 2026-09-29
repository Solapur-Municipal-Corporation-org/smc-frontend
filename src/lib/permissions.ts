import type { Role } from "@/types/auth";

const DEPARTMENT_ROLES: Role[] = ["DepartmentStaff", "DepartmentAdmin", "SuperAdmin"];

export function canAccessDepartmentPortal(role?: Role): boolean {
  return !!role && DEPARTMENT_ROLES.includes(role);
}

export function canManageMasters(role?: Role): boolean {
  return role === "DepartmentAdmin" || role === "SuperAdmin";
}

export function isSuperAdmin(role?: Role): boolean {
  return role === "SuperAdmin";
}
