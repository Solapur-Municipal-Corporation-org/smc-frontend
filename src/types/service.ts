import type { Department } from "./department";

export interface Service {
  id: string;
  departmentId: string;
  department?: Department;
  nameEn: string;
  nameMr: string;
  isIntegrated: boolean;
  integrationKey?: "service-a" | "service-b" | "service-c";
  requiredDocuments: string[];
}
