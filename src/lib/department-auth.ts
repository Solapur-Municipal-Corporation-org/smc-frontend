import Cookies from "js-cookie";

export interface AuthUser {
  userId: number;
  fullName: string;
  role: "SystemAdmin" | "DepartmentAdmin" | "DepartmentEmployee";
  departmentId: number | null;
  departmentName?: string | null;
}

export function getSession(): AuthUser | null {
  const raw = Cookies.get("dept_user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function clearSession() {
  Cookies.remove("dept_token");
  Cookies.remove("dept_user");
}

/** "Admin" here means anyone allowed to create/edit/delete masters — SystemAdmin (org-wide)
 * or DepartmentAdmin (their own department). Matches the backend's "AdminOnly" policy
 * (Program.cs). Plain DepartmentEmployee accounts are read-only in the master screens. */
export function isAdmin(): boolean {
  const role = getSession()?.role;
  return role === "SystemAdmin" || role === "DepartmentAdmin";
}
