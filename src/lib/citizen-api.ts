import axios from "axios";
import Cookies from "js-cookie";

export const API_BASE_URL = process.env.NEXT_PUBLIC_CITIZEN_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("cp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      Cookies.remove("cp_token");
      Cookies.remove("cp_user");
      if (typeof window !== "undefined") window.location.href = "/citizen/login";
    }
    return Promise.reject(err);
  }
);

// ---- Auth ----
// Login is mobile number + OTP only (no password). Registration is sent as
// multipart/form-data because it can include an uploaded ID document.
export const authApi = {
  requestOtp: (mobileNumber: string) => api.post("/auth/request-otp", { mobileNumber }),
  verifyOtp: (mobileNumber: string, otp: string) => api.post("/auth/verify-otp", { mobileNumber, otp }),
  register: (payload: FormData) =>
    api.post("/auth/register", payload, { headers: { "Content-Type": "multipart/form-data" } }),
  me: () => api.get("/auth/me"),
};

// ---- Departments / Services ----
export const catalogApi = {
  getDepartments: () => api.get("/departments"),
  getService: (serviceId: string) => api.get(`/services/${serviceId}`),
  getApplicationTypes: (serviceId: string) => api.get(`/catalog/services/${serviceId}/application-types`),
  getApplicantTypes: (applicationTypeId: string) => api.get(`/catalog/application-types/${applicationTypeId}/applicant-types`),
  getApplicationTypesForService: (departmentCode: string, serviceId: string) =>
    api.get(`/catalog/departments/${encodeURIComponent(departmentCode)}/services/${serviceId}/application-types`),
  getApplicantTypesForService: (departmentCode: string, serviceId: string, applicationTypeId: string) =>
    api.get(`/catalog/departments/${encodeURIComponent(departmentCode)}/services/${serviceId}/application-types/${applicationTypeId}/applicant-types`),
};

// ---- Applications ----
export const applicationsApi = {
  create: (payload: FormData) =>
    api.post("/applications", payload, { headers: { "Content-Type": "multipart/form-data" } }),
  getByNumber: (applicationNumber: string) => api.get(`/applications/track/${applicationNumber}`),
  getMine: () => api.get("/applications/mine"),
  downloadCertificate: (applicationId: string) =>
    api.get(`/applications/${applicationId}/certificate`, { responseType: "blob" }),
};

// ---- Payments ----
export const paymentsApi = {
  initiate: (applicationId: string) => api.post(`/payments/initiate`, { applicationId }),
  confirm: (payload: { applicationId: string; transactionId: string; paymentMode: string }) =>
    api.post(`/payments/confirm`, payload),
  getReceipt: (applicationId: string) => api.get(`/payments/receipt/${applicationId}`),
};
