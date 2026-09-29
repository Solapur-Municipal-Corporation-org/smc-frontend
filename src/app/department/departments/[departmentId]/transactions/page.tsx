"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDepartment } from "@/hooks/useDepartment";
import DepartmentSidebar from "@/components/department/DepartmentSidebar";
import TransactionMenu from "@/components/department/TransactionMenu";
import Loading from "@/components/common/Loading";

const TRANSACTION_ITEMS = [
  { key: "new-application", label: "New Application Entry" },
  { key: "payment", label: "Payment Collection" },
  { key: "status-update", label: "Application Status Update" },
];

export default function DepartmentTransactionsPage() {
  const params = useParams<{ departmentId: string }>();
  const { department, isLoading } = useDepartment(params.departmentId);
  const [activeKey, setActiveKey] = useState<string>();

  if (isLoading || !department) return <Loading />;

  return (
    <div className="flex">
      <DepartmentSidebar departmentId={department.id} departmentName={department.nameEn} />
      <div className="flex-1 flex">
        <div className="w-64 border-r border-gray-100 p-4">
          <TransactionMenu items={TRANSACTION_ITEMS} activeKey={activeKey} onSelect={setActiveKey} />
        </div>
        <div className="flex-1 p-6">
          {activeKey ? (
            <p className="text-gray-500 text-sm">
              Transaction form for &ldquo;{TRANSACTION_ITEMS.find((t) => t.key === activeKey)?.label}&rdquo; renders here.
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Select a transaction type to begin.</p>
          )}
        </div>
      </div>
    </div>
  );
}
