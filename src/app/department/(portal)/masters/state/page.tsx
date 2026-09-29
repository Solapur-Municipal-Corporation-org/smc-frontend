"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { State } from "@/types/department-portal";

export default function StateMasterPage() {
  return (
    <GenericMasterPage<State>
      title="State Master"
      description="States, linked to a Country. Used by the District master."
      apiPath="/masters/state"
      idKey="stateId"
      searchKeys={["stateName"]}
      columns={[
        { key: "stateName", label: "State Name" },
        { key: "countryId", label: "Country Id" },
        { key: "remarks", label: "Remarks" },
      ]}
      formFields={[
        { name: "stateName", label: "State Name", type: "text", required: true },
        {
          name: "countryId",
          label: "Country",
          type: "select",
          required: true,
          optionsEndpoint: "/masters/country",
          optionValueKey: "countryId",
          optionLabelKey: "countryName",
        },
        { name: "remarks", label: "Remarks", type: "textarea" },
      ]}
      emptyRecord={{ stateName: "", countryId: 1, remarks: "" }}
    />
  );
}
