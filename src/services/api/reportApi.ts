import api from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export const reportApi = {
  departmentSummary: (departmentId: string) =>
    api.get(API_ENDPOINTS.REPORT.DEPARTMENT_SUMMARY(departmentId)),
};
