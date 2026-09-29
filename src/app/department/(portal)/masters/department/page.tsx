"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { Department } from "@/types/department-portal";

export default function DepartmentMasterPage() {
  return (
    <GenericMasterPage<Department>
      title="Department Master"
      description="All departments, scoped under the Organization Master."
      apiPath="/department"
      idKey="departmentId"
      searchKeys={["departmentName", "departmentNameMarathi", "departmentCode"]}
      columns={[
        { key: "srNo", label: "Sr. No." },
        { key: "departmentName", label: "Department Name" },
        { key: "departmentCode", label: "Code" },
        { key: "serviceCount", label: "Services" },
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
      formFields={[
        {
          name: "organizationId",
          label: "Organization",
          type: "select",
          required: true,
          optionsEndpoint: "/masters/organization",
          optionValueKey: "organizationId",
          optionLabelKey: "organizationName",
        },
        { name: "srNo", label: "Sr. No.", type: "number", required: true },
        { name: "departmentName", label: "Department Name (English)", type: "text", required: true },
        { name: "departmentNameMarathi", label: "Department Name (Marathi)", type: "text" },
        { name: "departmentCode", label: "Department Code", type: "text", required: true },
        { name: "primaryFunctions", label: "Primary Functions", type: "textarea" },
        { name: "departmentHead", label: "Department Head", type: "text" },
        { name: "email", label: "Email", type: "text" },
        { name: "mobileNumber", label: "Mobile Number", type: "text" },
        { name: "isActive", label: "Active", type: "checkbox" },
      ]}
      emptyRecord={{ organizationId: 1, srNo: 0, departmentName: "", departmentCode: "", isActive: true }}
    />
  );
}
