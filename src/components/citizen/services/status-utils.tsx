import { ApplicationStatus } from "@/types/citizen-portal";
import { Language } from "@/lib/i18n/citizen-translations";

export function statusBadgeVariant(status: ApplicationStatus): "default" | "success" | "warning" | "destructive" {
  switch (status) {
    case "Approved":
      return "success";
    case "Rejected":
      return "destructive";
    case "UnderReview":
      return "warning";
    default:
      return "default";
  }
}

const statusLabelsMr: Record<ApplicationStatus, string> = {
  Pending: "प्रलंबित",
  UnderReview: "पुनरावलोकनाधीन",
  Approved: "मंजूर",
  Rejected: "नाकारले",
};

export function statusLabel(status: ApplicationStatus, language: Language = "en"): string {
  if (language === "mr") return statusLabelsMr[status];
  switch (status) {
    case "UnderReview":
      return "Under Review";
    default:
      return status;
  }
}

export function statusStep(status: ApplicationStatus): number {
  switch (status) {
    case "Pending":
      return 1;
    case "UnderReview":
      return 2;
    case "Approved":
      return 3;
    case "Rejected":
      return 3;
    default:
      return 0;
  }
}
