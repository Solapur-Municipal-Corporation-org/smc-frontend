"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { City } from "@/types/department-portal";

export default function CityMasterPage() {
  return (
    <GenericMasterPage<City>
      title="City Master"
      description="Cities, linked to a Tahsil."
      apiPath="/masters/city"
      idKey="cityId"
      searchKeys={["cityName"]}
      columns={[
        { key: "cityName", label: "City Name" },
        { key: "tahsilId", label: "Tahsil Id" },
        { key: "remarks", label: "Remarks" },
      ]}
      formFields={[
        { name: "cityName", label: "City Name", type: "text", required: true },
        {
          name: "tahsilId",
          label: "Tahsil",
          type: "select",
          required: true,
          optionsEndpoint: "/masters/tahsil",
          optionValueKey: "tahsilId",
          optionLabelKey: "tahsilName",
        },
        { name: "remarks", label: "Remarks", type: "textarea" },
      ]}
      emptyRecord={{ cityName: "", tahsilId: 1, remarks: "" }}
    />
  );
}
