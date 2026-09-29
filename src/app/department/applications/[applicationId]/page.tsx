"use client";
import { useParams } from "next/navigation";
import { useApplication } from "@/hooks/useApplication";
import { applicationApi } from "@/services/api/applicationApi";
import Loading from "@/components/common/Loading";
import { APPLICATION_STATUS_COLORS } from "@/lib/constants";
import type { ApplicationStatus } from "@/types/application";

const NEXT_STATUSES: ApplicationStatus[] = ["UnderReview", "Approved", "Rejected", "Completed"];

export default function DepartmentApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const { application, isLoading } = useApplication(params.applicationId);

  if (isLoading) return <Loading />;
  if (!application) return <p className="text-gray-500 p-8">Application not found.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Application #{application.id.slice(0, 8)}
        </h1>
        <span className={`text-xs px-3 py-1 rounded-full ${APPLICATION_STATUS_COLORS[application.status]}`}>
          {application.status}
        </span>
      </div>
      <div className="flex gap-2">
        {NEXT_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => applicationApi.updateStatus(application.id, status)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-brand-light"
          >
            Mark {status}
          </button>
        ))}
      </div>
    </div>
  );
}
