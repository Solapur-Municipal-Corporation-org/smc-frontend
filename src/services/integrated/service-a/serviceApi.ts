import api from "@/lib/axios";

// Adapter for the integrated Service A. Mirrors the backend
// SMC.Master.Infrastructure.Integrations.ServiceA adapter.
export const serviceAApi = {
  submit: (payload: Record<string, unknown>) => api.post("/integrated/service-a/submit", payload),
  status: (referenceId: string) => api.get(`/integrated/service-a/status/${referenceId}`),
};
