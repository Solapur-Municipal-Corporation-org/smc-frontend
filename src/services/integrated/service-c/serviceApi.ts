import api from "@/lib/axios";

export const serviceCApi = {
  submit: (payload: Record<string, unknown>) => api.post("/integrated/service-c/submit", payload),
  status: (referenceId: string) => api.get(`/integrated/service-c/status/${referenceId}`),
};
