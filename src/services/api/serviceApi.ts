import api from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import type { Service } from "@/types/service";

export const serviceApi = {
  list: () => api.get<Service[]>(API_ENDPOINTS.SERVICE.LIST),
  byDepartment: (departmentId: string) =>
    api.get<Service[]>(API_ENDPOINTS.SERVICE.BY_DEPARTMENT(departmentId)),
};
