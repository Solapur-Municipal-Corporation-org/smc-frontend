import api from "@/lib/axios";

export const serviceBApi = {
  submit: (payload: Record<string, unknown>) => api.post("/integrated/service-b/submit", payload),
  status: (referenceId: string) => api.get(`/integrated/service-b/status/${referenceId}`),
};
