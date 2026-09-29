import api from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import type { Citizen } from "@/types/citizen";

export const citizenApi = {
  me: () => api.get<Citizen>(API_ENDPOINTS.CITIZEN.ME),
  update: (payload: Partial<Citizen>) => api.put(API_ENDPOINTS.CITIZEN.UPDATE, payload),
};
