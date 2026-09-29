"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutGrid, Database, Repeat, FileBarChart } from "lucide-react";

interface DepartmentSidebarProps {
  departmentId: string;
  departmentName: string;
}

const GROUPS = [
  { key: "masters", label: "Masters", icon: Database },
  { key: "transactions", label: "Transactions", icon: Repeat },
  { key: "reports", label: "Reports", icon: FileBarChart },
] as const;

export default function DepartmentSidebar({ departmentId, departmentName }: DepartmentSidebarProps) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>("masters");

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-4rem)] p-4">
      <div className="flex items-center gap-2 mb-6 text-brand-dark">
        <LayoutGrid size={18} />
        <span className="font-medium truncate">{departmentName}</span>
      </div>
      <nav className="space-y-1">
        {GROUPS.map(({ key, label, icon: Icon }) => {
          const isOpen = openGroup === key;
          return (
            <div key={key}>
              <button
                onClick={() => setOpenGroup(isOpen ? null : key)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} /> {label}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="ml-7 mt-1 space-y-1">
                  <Link
                    href={`/department/departments/${departmentId}/${key}`}
                    className={`block px-3 py-1.5 rounded-md text-sm ${
                      pathname?.includes(`/${key}`)
                        ? "bg-brand-light/10 text-brand-dark"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {label} overview
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
