"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { UserAccount } from "@/types/department-portal";

export default function UserMasterPage() {
  return (
    <GenericMasterPage<UserAccount>
      title="User Master"
      description="Admin / Department user accounts — day-to-day sign-in to the Department Portal is by OTP (see Login); a password set here is kept only as an emergency fallback."
      apiPath="/user"
      idKey="userId"
      searchKeys={["fullName", "mobileNumber", "email"]}
      columns={[
        { key: "fullName", label: "Full Name" },
        { key: "mobileNumber", label: "Mobile Number" },
        { key: "role", label: "Role" },
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
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "mobileNumber", label: "Mobile Number", type: "text", required: true },
        { name: "email", label: "Email", type: "text" },
        {
          name: "role",
          label: "Role",
          type: "select",
          required: true,
          staticOptions: [
            { value: "SystemAdmin", label: "System Admin (all departments)" },
            { value: "DepartmentAdmin", label: "Department Admin" },
            { value: "DepartmentEmployee", label: "Department Employee" },
          ],
        },
        {
          name: "departmentId",
          label: "Department (for Department User)",
          type: "select",
          optionsEndpoint: "/department",
          optionValueKey: "departmentId",
          optionLabelKey: "departmentName",
        },
        { name: "password", label: "Password (leave blank on edit to keep unchanged)", type: "text" },
        { name: "isActive", label: "Active", type: "checkbox" },
      ]}
      emptyRecord={{ fullName: "", mobileNumber: "", role: "DepartmentEmployee", isActive: true, password: "" }}
    />
  );
}
