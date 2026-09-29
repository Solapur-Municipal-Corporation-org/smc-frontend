import axios from "axios";
import Cookies from "js-cookie";

// Points at the ONE common API (same CitizenPortal.Api process citizen/admin already use) —
// see INTEGRATION_REPORT.md. No separate Department Portal backend/URL.
const departmentApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

// Uses its own cookie names (dept_token/dept_user) rather than reusing "smc_token"/"cp_token" —
// those already belong to the Admin and Citizen sessions respectively, and a staff member may
// well have all three portals open in different tabs during testing.
departmentApi.interceptors.request.use((config) => {
  const token = Cookies.get("dept_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

departmentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes("department/auth/");
    if (error.response?.status === 401 && !isAuthRequest && typeof window !== "undefined") {
      Cookies.remove("dept_token");
      Cookies.remove("dept_user");
      window.location.href = "/department/login";
    }
    return Promise.reject(error);
  }
);

export default departmentApi;

// Same rationale as citizen-api.ts's getApiErrorMessage — ASP.NET Core's default error
// shapes (ValidationProblemDetails / ProblemDetails) aren't just `{ message }`.
export function getApiErrorMessage(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string" && data.trim()) return data;
  if (data.errors && typeof data.errors === "object") {
    const messages = Object.entries(data.errors as Record<string, string[]>)
      .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
      .join(" | ");
    if (messages) return messages;
  }
  if (data.message) return data.message;
  if (data.detail) return data.detail;
  if (data.title) return data.title;
  return fallback;
}
