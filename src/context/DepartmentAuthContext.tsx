"use client";
import * as React from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import departmentApi, { getApiErrorMessage } from "@/lib/department-api";

export interface DepartmentAuthUser {
  userId: number;
  fullName: string;
  role: "SystemAdmin" | "DepartmentAdmin" | "DepartmentEmployee";
  departmentId: number | null;
  departmentName?: string | null;
  departmentNameMarathi?: string | null;
}

interface DepartmentAuthContextValue {
  user: DepartmentAuthUser | null;
  loading: boolean;
  /** Step 1 of OTP login: sends the OTP, returns ok/error for the UI to show. */
  requestOtp: (mobileNumber: string) => Promise<{ ok: boolean; error?: string; demoOtp?: string }>;
  /** Step 2: verifies the OTP and completes login. */
  verifyOtp: (mobileNumber: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const DepartmentAuthContext = React.createContext<DepartmentAuthContextValue | undefined>(undefined);

export function DepartmentAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<DepartmentAuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const stored = Cookies.get("dept_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
    setLoading(false);
  }, []);

  const requestOtp = async (mobileNumber: string) => {
    try {
      const response = await departmentApi.post("/department/auth/request-otp", { mobileNumber });
      return { ok: true, demoOtp: response.data.demoOtp };
    } catch (err) {
      return { ok: false, error: getApiErrorMessage(err, "Could not send OTP. Please try again.") };
    }
  };

  const verifyOtp = async (mobileNumber: string, otp: string) => {
    try {
      const res = await departmentApi.post("/department/auth/verify-otp", { mobileNumber, otp });
      const { token, expiresAt, ...userFields } = res.data;
      const deptUser: DepartmentAuthUser = {
        userId: userFields.userId,
        fullName: userFields.fullName,
        role: userFields.role,
        departmentId: userFields.departmentId ?? null,
        departmentName: userFields.departmentName ?? null,
        departmentNameMarathi: userFields.departmentNameMarathi ?? null,
      };
      const expires = new Date(expiresAt);
      Cookies.set("dept_token", token, { expires, sameSite: "strict" });
      Cookies.set("dept_user", JSON.stringify(deptUser), { expires, sameSite: "strict" });
      setUser(deptUser);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: getApiErrorMessage(err, "Incorrect OTP.") };
    }
  };

  const logout = () => {
    Cookies.remove("dept_token");
    Cookies.remove("dept_user");
    setUser(null);
    router.push("/department/login");
  };

  return (
    <DepartmentAuthContext.Provider value={{ user, loading, requestOtp, verifyOtp, logout }}>
      {children}
    </DepartmentAuthContext.Provider>
  );
}

export function useDepartmentAuth() {
  const ctx = React.useContext(DepartmentAuthContext);
  if (!ctx) throw new Error("useDepartmentAuth must be used within DepartmentAuthProvider");
  return ctx;
}
