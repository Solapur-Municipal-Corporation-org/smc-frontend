"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { Organization } from "@/types/department-portal";

export default function OrganizationMasterPage() {
  return (
    <GenericMasterPage<Organization>
      title="Organization Master"
      description="Root master — every department is scoped under an organization."
      apiPath="/masters/organization"
      idKey="organizationId"
      searchKeys={["organizationName", "organizationNameMarathi", "location"]}
      columns={[
        { key: "organizationName", label: "Organization Name" },
        { key: "organizationNameMarathi", label: "Marathi Name" },
        { key: "organizationType", label: "Type" },
        { key: "location", label: "Location" },
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
        { name: "organizationName", label: "Organization Name", type: "text", required: true },
        { name: "organizationNameMarathi", label: "Marathi Name", type: "text" },
        { name: "organizationType", label: "Type", type: "text" },
        { name: "email", label: "Email", type: "text" },
        { name: "phoneNumber1", label: "Phone Number 1", type: "text" },
        { name: "phoneNumber2", label: "Phone Number 2", type: "text" },
        { name: "website", label: "Website", type: "text" },
        { name: "gstNumber", label: "GST Number", type: "text" },
        { name: "panNumber", label: "PAN Number", type: "text" },
        { name: "registrationNumber", label: "Registration Number", type: "text" },
        { name: "activeCommissioner", label: "Active Commissioner", type: "text" },
        { name: "activeMayor", label: "Active Mayor", type: "text" },
        { name: "activeDyMayor", label: "Active Dy. Mayor", type: "text" },
        { name: "activeStandingChairman", label: "Active Standing Chairman", type: "text" },
        { name: "location", label: "Location", type: "text" },
        { name: "isActive", label: "Active", type: "checkbox" },
      ]}
      emptyRecord={{ organizationName: "", organizationNameMarathi: "", organizationType: "", isActive: true }}
    />
  );
}
