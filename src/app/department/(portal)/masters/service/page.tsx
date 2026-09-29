"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { Service } from "@/types/department-portal";

export default function ServiceMasterPage() {
  return (
    <GenericMasterPage<Service>
      title="Service Master"
      description="Services offered by a Department — drives the service count shown on dashboard cards."
      apiPath="/service"
      idKey="serviceId"
      searchKeys={["serviceName", "serviceNameMarathi", "serviceCode"]}
      columns={[
        { key: "serviceName", label: "Service Name" },
        { key: "serviceCode", label: "Code" },
        { key: "departmentId", label: "Department Id" },
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
          name: "departmentId",
          label: "Department",
          type: "select",
          required: true,
          optionsEndpoint: "/department",
          optionValueKey: "departmentId",
          optionLabelKey: "departmentName",
        },
        { name: "serviceName", label: "Service Name (English)", type: "text", required: true },
        { name: "serviceNameMarathi", label: "Service Name (Marathi)", type: "text" },
        { name: "serviceCode", label: "Service Code", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "isActive", label: "Active", type: "checkbox" },
      ]}
      emptyRecord={{ departmentId: 1, serviceName: "", serviceCode: "", isActive: true }}
    />
  );
}
