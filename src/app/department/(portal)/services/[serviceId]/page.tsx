"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiLoader } from "react-icons/fi";
import departmentApi, { getApiErrorMessage } from "@/lib/department-api";
import { useLanguage } from "@/lib/department-i18n";

interface DepartmentServiceDetail {
  serviceId: number;
  departmentId: number;
  serviceName: string;
  serviceNameMarathi?: string | null;
  serviceCode: string;
  description?: string | null;
  fee: number;
  processingDays: number;
  departmentName: string;
  departmentNameMarathi?: string | null;
}

export default function DepartmentServicePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { lang } = useLanguage();
  const [service, setService] = useState<DepartmentServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    departmentApi.get<DepartmentServiceDetail>(`/department/services/${serviceId}`)
      .then(({ data }) => {
        if (!cancelled) setService(data);
      })
      .catch((requestError) => {
        if (cancelled) return;
        setStatusCode(requestError?.response?.status ?? null);
        setError(getApiErrorMessage(requestError, "Could not load this service."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [serviceId]);

  const title = service && lang === "mr"
    ? service.serviceNameMarathi || service.serviceName
    : service?.serviceName;
  const department = service && lang === "mr"
    ? service.departmentNameMarathi || service.departmentName
    : service?.departmentName;

  return (
    <section className="max-w-3xl">
      <Link href="/department/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <FiArrowLeft /> {lang === "mr" ? "डॅशबोर्डकडे परत" : "Back to dashboard"}
      </Link>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500"><FiLoader className="animate-spin" /> Loading service...</div>
      ) : statusCode === 403 ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {lang === "mr" ? "या सेवेचा प्रवेश तुम्हाला नाही." : "You do not have access to this service."}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {statusCode === 404
            ? (lang === "mr" ? "सेवा सापडली नाही." : "Service not found.")
            : error}
        </div>
      ) : service ? (
        <article className="rounded-xl border border-gray-200 bg-white p-5 sm:p-8 shadow-sm">
          <p className="text-sm font-medium text-[#AC5288]">{department}</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
          {service.description && <p className="mt-4 leading-relaxed text-gray-600">{service.description}</p>}
          <dl className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Service code</dt>
              <dd className="mt-1 font-medium text-gray-900">{service.serviceCode}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Fee</dt>
              <dd className="mt-1 font-medium text-gray-900">{service.fee}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Processing days</dt>
              <dd className="mt-1 font-medium text-gray-900">{service.processingDays}</dd>
            </div>
          </dl>
        </article>
      ) : null}
    </section>
  );
}
