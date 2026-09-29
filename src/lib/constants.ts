export const BRAND = {
  gradientFrom: "#AC5288",
  gradientTo: "#3C1053",
};

export const ROLES = {
  CITIZEN: "Citizen",
  DEPARTMENT_STAFF: "DepartmentStaff",
  DEPARTMENT_ADMIN: "DepartmentAdmin",
  SUPER_ADMIN: "SuperAdmin",
} as const;

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Submitted: "bg-blue-100 text-blue-700",
  UnderReview: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
  Completed: "bg-purple-100 text-purple-700",
};
