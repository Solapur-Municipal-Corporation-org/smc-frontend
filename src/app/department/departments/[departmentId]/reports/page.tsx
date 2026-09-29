"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDepartment } from "@/hooks/useDepartment";
import DepartmentSidebar from "@/components/department/DepartmentSidebar";
import ReportMenu from "@/components/department/ReportMenu";
import Loading from "@/components/common/Loading";

const REPORT_ITEMS = [
  { key: "summary", label: "Department Summary" },
  { key: "pending", label: "Pending Applications" },
  { key: "revenue", label: "Revenue Report" },
];

export default function DepartmentReportsPage() {
  const params = useParams<{ departmentId: string }>();
  const { department, isLoading } = useDepartment(params.departmentId);
  const [activeKey, setActiveKey] = useState<string>();

  if (isLoading || !department) return <Loading />;

  return (
    <div className="flex">
      <DepartmentSidebar departmentId={department.id} departmentName={department.nameEn} />
      <div className="flex-1 flex">
        <div className="w-64 border-r border-gray-100 p-4">
          <ReportMenu items={REPORT_ITEMS} onSelect={setActiveKey} />
        </div>
        <div className="flex-1 p-6">
          {activeKey ? (
            <p className="text-gray-500 text-sm">
              {REPORT_ITEMS.find((r) => r.key === activeKey)?.label} renders here.
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Select a report to generate.</p>
          )}
        </div>
      </div>
    </div>
  );
}
