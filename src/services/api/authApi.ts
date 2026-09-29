import api from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export const authApi = {
  login: (payload: LoginRequest) =>
    api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, payload),
  sendOtp: (mobileNumber: string, email: string) =>
    api.post(API_ENDPOINTS.AUTH.SEND_OTP, { mobileNumber, email }),
  verifyOtp: (mobileNumber: string, otp: string) =>
    api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { mobileNumber, otp }),
  register: (payload: Record<string, unknown>) =>
    api.post(API_ENDPOINTS.AUTH.REGISTER, payload),
};
