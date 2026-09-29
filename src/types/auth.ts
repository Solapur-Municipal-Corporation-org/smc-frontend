export type Role = "Citizen" | "DepartmentStaff" | "DepartmentAdmin" | "SuperAdmin";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  role: Role;
  expiresAt: string;
}
