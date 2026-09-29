export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
  },
  CITIZEN: {
    ME: "/citizen/me",
    UPDATE: "/citizen/update",
  },
  DEPARTMENT: {
    LIST: "/department",
    BY_ID: (id: string) => `/department/${id}`,
  },
  SERVICE: {
    LIST: "/service",
    BY_DEPARTMENT: (departmentId: string) => `/service/department/${departmentId}`,
  },
  APPLICATION: {
    LIST: "/application",
    BY_ID: (id: string) => `/application/${id}`,
    CREATE: "/application",
    UPDATE_STATUS: (id: string) => `/application/${id}/status`,
  },
  TRANSACTION: {
    LIST: "/transaction",
    BY_APPLICATION: (applicationId: string) => `/transaction/application/${applicationId}`,
  },
  REPORT: {
    DEPARTMENT_SUMMARY: (departmentId: string) => `/report/department/${departmentId}/summary`,
  },
};
