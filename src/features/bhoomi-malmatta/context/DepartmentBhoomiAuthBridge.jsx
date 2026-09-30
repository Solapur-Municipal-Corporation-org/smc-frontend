"use client";

import { useDepartmentAuth } from "@/context/DepartmentAuthContext";
import { ExternalAuthProvider } from "./AuthContext";

const allowedRoles = new Set(["Admin", "Officer", "Staff", "JE", "OS", "AssistantCommissioner"]);

function configuredRoleFor(userId) {
  try {
    const mappings = JSON.parse(process.env.NEXT_PUBLIC_BHOOMI_DEPARTMENT_ROLE_MAP || "{}");
    const role = mappings[String(userId)];
    return allowedRoles.has(role) ? role : null;
  } catch {
    return null;
  }
}

export default function DepartmentBhoomiAuthBridge({ children }) {
  const { user, loading, logout } = useDepartmentAuth();
  const role = user
    ? configuredRoleFor(user.userId) || (["SystemAdmin", "DepartmentAdmin"].includes(user.role) ? "Admin" : "Staff")
    : null;
  const bhoomiUser = user ? { ...user, username: String(user.userId), role } : null;

  return (
    <ExternalAuthProvider user={bhoomiUser} hydrated={!loading} logout={logout}>
      <div className="bhoomi-malmatta">{children}</div>
    </ExternalAuthProvider>
  );
}
