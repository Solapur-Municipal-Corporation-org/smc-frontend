"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDepartment } from "@/hooks/useDepartment";
import DepartmentSidebar from "@/components/department/DepartmentSidebar";
import MasterMenu from "@/components/department/MasterMenu";
import Loading from "@/components/common/Loading";

const MASTER_ITEMS = [
  { key: "organization", label: "Organization Master" },
  { key: "department", label: "Department Master" },
  { key: "service", label: "Service Master" },
  { key: "user", label: "User Master" },
  { key: "geography", label: "Geography Master" },
  { key: "employee", label: "Employee Master" },
];

export default function DepartmentMastersPage() {
  const params = useParams<{ departmentId: string }>();
  const { department, isLoading } = useDepartment(params.departmentId);
  const [activeKey, setActiveKey] = useState<string>();

  if (isLoading || !department) return <Loading />;

  return (
    <div className="flex">
      <DepartmentSidebar departmentId={department.id} departmentName={department.nameEn} />
      <div className="flex-1 flex">
        <div className="w-64 border-r border-gray-100 p-4">
          <MasterMenu items={MASTER_ITEMS} activeKey={activeKey} onSelect={setActiveKey} />
        </div>
        <div className="flex-1 p-6">
          {activeKey ? (
            <p className="text-gray-500 text-sm">
              Inline entry form for &ldquo;{MASTER_ITEMS.find((m) => m.key === activeKey)?.label}&rdquo;
              renders here — Submit saves and clears, Cancel returns to the menu.
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Select a master from the left to begin.</p>
          )}
        </div>
      </div>
    </div>
  );
}
