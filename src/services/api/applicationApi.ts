import api from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import type { Application, ApplicationStatus } from "@/types/application";

export const applicationApi = {
  list: () => api.get<Application[]>(API_ENDPOINTS.APPLICATION.LIST),
  byId: (id: string) => api.get<Application>(API_ENDPOINTS.APPLICATION.BY_ID(id)),
  create: (payload: Partial<Application>) =>
    api.post<Application>(API_ENDPOINTS.APPLICATION.CREATE, payload),
  updateStatus: (id: string, status: ApplicationStatus) =>
    api.patch(API_ENDPOINTS.APPLICATION.UPDATE_STATUS(id), { status }),
};
