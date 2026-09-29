"use client";
import * as React from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/citizen-api";
import { Citizen } from "@/types/citizen-portal";

interface AuthContextValue {
  citizen: Citizen | null;
  loading: boolean;
  requestOtp: (mobileNumber: string) => Promise<{ ok: boolean; error?: string; demoOtp?: string }>;
  verifyOtp: (mobileNumber: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function CitizenAuthProvider({ children }: { children: React.ReactNode }) {
  const [citizen, setCitizen] = React.useState<Citizen | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const stored = Cookies.get("cp_user");
    if (stored) {
      try {
        setCitizen(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
    if (Cookies.get("cp_token")) {
      authApi.me()
        .then((res) => {
          setCitizen(res.data);
          Cookies.set("cp_user", JSON.stringify(res.data), { expires: 1 });
        })
        .catch(() => undefined)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const requestOtp = async (mobileNumber: string) => {
    try {
      const response = await authApi.requestOtp(mobileNumber);
      return { ok: true, demoOtp: response.data.demoOtp };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not send OTP. Please try again.";
      return { ok: false, error: message };
    }
  };

  const verifyOtp = async (mobileNumber: string, otp: string) => {
    try {
      const res = await authApi.verifyOtp(mobileNumber, otp);
      const { token, citizen: c } = res.data;
      Cookies.set("cp_token", token, { expires: 1 });
      Cookies.set("cp_user", JSON.stringify(c), { expires: 1 });
      setCitizen(c);
      return { ok: true };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Citizen is not registered. Please create an account.";
      return { ok: false, error: message };
    }
  };

  const logout = () => {
    Cookies.remove("cp_token");
    Cookies.remove("cp_user");
    setCitizen(null);
    router.push("/citizen/login");
  };

  return <AuthContext.Provider value={{ citizen, loading, requestOtp, verifyOtp, logout }}>{children}</AuthContext.Provider>;
}

export function useCitizenAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
