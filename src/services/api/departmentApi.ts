import api from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import type { Department } from "@/types/department";

export const departmentApi = {
  list: () => api.get<Department[]>(API_ENDPOINTS.DEPARTMENT.LIST),
  byId: (id: string) => api.get<Department>(API_ENDPOINTS.DEPARTMENT.BY_ID(id)),
};
