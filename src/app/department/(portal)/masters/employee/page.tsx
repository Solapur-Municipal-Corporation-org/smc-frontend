"use client";

import { useEffect, useState } from "react";
import api from "@/lib/department-api";
import { isAdmin } from "@/lib/department-auth";
import { Employee } from "@/types/department-portal";
import DataTable from "@/components/department/DataTable";
import EmployeeWizard from "@/components/department/EmployeeWizard";

export default function EmployeeMasterPage() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0); // bump this to force a fresh blank form
  const canWrite = isAdmin();

  const load = () => {
    setLoading(true);
    api
      .get<Employee[]>("/masters/employee")
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openEdit = (row: Employee) => {
    setEditingId(row.employeeId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (row: Employee) => {
    if (!confirm(`Delete employee "${row.firstNameEnglish} ${row.lastNameEnglish}"? This also removes their address, documents, education, bank, salary and family records.`)) return;
    await api.delete(`/masters/employee/${row.employeeId}`);
    if (editingId === row.employeeId) {
      setEditingId(null);
      setFormKey((k) => k + 1);
    }
    load();
  };

  // After a successful save, clear the form back to a blank "new employee" state
  const onSaved = () => {
    setEditingId(null);
    setFormKey((k) => k + 1);
    load();
  };

  // "New Employee" link inside the wizard header — clears the form without saving
  const onResetForm = () => {
    setEditingId(null);
    setFormKey((k) => k + 1);
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Employee Master</h1>
        <p className="text-sm text-gray-500">
          One combined form covers Employee, Address, Documents, Education, Bank, Salary and Family — all saved together per employee.
        </p>
      </div>

      {canWrite && (
        <div className="mb-6">
          <EmployeeWizard
            key={editingId ?? `new-${formKey}`}
            employeeId={editingId}
            onClose={onResetForm}
            onSaved={onSaved}
          />
        </div>
      )}

      {loading ? (
        <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
      ) : (
        <DataTable
          columns={[
            { key: "employeeCode", label: "Employee Code" },
            { key: "firstNameEnglish", label: "First Name" },
            { key: "lastNameEnglish", label: "Last Name" },
            { key: "mobileNumber", label: "Mobile" },
            { key: "gender", label: "Gender" },
            {
              key: "isActive",
              label: "Status",
              render: (row) => (
                <span className={`text-xs px-2 py-1 rounded-full ${row.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {row.isActive ? "Active" : "Inactive"}
                </span>
              ),
            },
          ]}
          data={rows}
          searchKeys={["employeeCode", "firstNameEnglish", "lastNameEnglish", "mobileNumber"]}
          onEdit={canWrite ? openEdit : undefined}
          onDelete={canWrite ? onDelete : undefined}
        />
      )}
    </div>
  );
}
