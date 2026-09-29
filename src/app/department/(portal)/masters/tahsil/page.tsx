"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { Tahsil } from "@/types/department-portal";

export default function TahsilMasterPage() {
  return (
    <GenericMasterPage<Tahsil>
      title="Tahsil Master"
      description="Tahsils, linked to a District. Used by the City master."
      apiPath="/masters/tahsil"
      idKey="tahsilId"
      searchKeys={["tahsilName"]}
      columns={[
        { key: "tahsilName", label: "Tahsil Name" },
        { key: "districtId", label: "District Id" },
        { key: "remarks", label: "Remarks" },
      ]}
      formFields={[
        { name: "tahsilName", label: "Tahsil Name", type: "text", required: true },
        {
          name: "districtId",
          label: "District",
          type: "select",
          required: true,
          optionsEndpoint: "/masters/district",
          optionValueKey: "districtId",
          optionLabelKey: "districtName",
        },
        { name: "remarks", label: "Remarks", type: "textarea" },
      ]}
      emptyRecord={{ tahsilName: "", districtId: 1, remarks: "" }}
    />
  );
}
