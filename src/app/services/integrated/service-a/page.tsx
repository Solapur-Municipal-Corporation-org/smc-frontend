"use client";
import { useState } from "react";
import ServiceShell from "@/components/integrated-services/ServiceShell";
import ServiceApplicationLayout from "@/components/integrated-services/ServiceApplicationLayout";
import { serviceAApi } from "@/services/integrated/service-a/serviceApi";

export default function ServiceAPage() {
  const [reference, setReference] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await serviceAApi.submit({});
      setReference(data.referenceId ?? "PENDING");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ServiceShell title="Service A">
      <ServiceApplicationLayout
        form={
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500">
              Integrated application form for ServiceA goes here.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-gradient text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        }
        summary={
          <div className="text-sm text-gray-600">
            {reference ? (
              <p>Reference: <span className="font-medium">{reference}</span></p>
            ) : (
              <p>Application summary will appear here once submitted.</p>
            )}
          </div>
        }
      />
    </ServiceShell>
  );
}
