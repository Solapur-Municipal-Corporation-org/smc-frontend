"use client";

import { useEffect, useState } from "react";
import departmentApi, { getApiErrorMessage } from "@/lib/department-api";
import { useDepartmentAuth } from "@/context/DepartmentAuthContext";

interface DashboardData {
  user: { userId: number; fullName: string; role: string };
  department: { departmentId: number; departmentName: string; departmentNameMarathi?: string; departmentCode?: string } | null;
  serviceCount: number;
  applicationCounts: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
  } | null;
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export default function DepartmentDashboardPage() {
  const { user } = useDepartmentAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentApi
      .get<DashboardData>("/department/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => setError(getApiErrorMessage(err, "Could not load dashboard.")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-[40vh] flex items-center justify-center text-gray-400 text-sm">Loading...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Welcome, {data.user.fullName}
        </h1>
        <p className="text-sm text-gray-500">
          {data.user.role}
          {data.department ? ` · ${data.department.departmentName}` : " · All Departments"}
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Active Services" value={data.serviceCount} accent="text-gray-900" />
        </div>
      </div>

      {data.applicationCounts && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Citizen Applications</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total" value={data.applicationCounts.total} accent="text-gray-900" />
            <StatCard label="Pending" value={data.applicationCounts.pending} accent="text-amber-600" />
            <StatCard label="Under Review" value={data.applicationCounts.underReview} accent="text-blue-600" />
            <StatCard label="Approved" value={data.applicationCounts.approved} accent="text-green-600" />
            <StatCard label="Rejected" value={data.applicationCounts.rejected} accent="text-red-600" />
          </div>
        </div>
      )}

      {!data.department && !data.applicationCounts && (
        <p className="text-sm text-gray-400">
          As a SystemAdmin you're not scoped to one department — pick a department from Masters to drill in.
        </p>
      )}
    </div>
  );
}
