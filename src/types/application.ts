export type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "UnderReview"
  | "Approved"
  | "Rejected"
  | "Completed";

export interface Application {
  id: string;
  serviceId: string;
  citizenId: string;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  formData: Record<string, unknown>;
  documents: { name: string; url: string }[];
}
