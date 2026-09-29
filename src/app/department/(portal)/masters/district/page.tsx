"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { District } from "@/types/department-portal";

export default function DistrictMasterPage() {
  return (
    <GenericMasterPage<District>
      title="District Master"
      description="Districts, linked to a State. Used by the Tahsil master."
      apiPath="/masters/district"
      idKey="districtId"
      searchKeys={["districtName"]}
      columns={[
        { key: "districtName", label: "District Name" },
        { key: "stateId", label: "State Id" },
        { key: "remarks", label: "Remarks" },
      ]}
      formFields={[
        { name: "districtName", label: "District Name", type: "text", required: true },
        {
          name: "stateId",
          label: "State",
          type: "select",
          required: true,
          optionsEndpoint: "/masters/state",
          optionValueKey: "stateId",
          optionLabelKey: "stateName",
        },
        { name: "remarks", label: "Remarks", type: "textarea" },
      ]}
      emptyRecord={{ districtName: "", stateId: 1, remarks: "" }}
    />
  );
}
