"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { Location } from "@/types/department-portal";

export default function LocationMasterPage() {
  return (
    <GenericMasterPage<Location>
      title="Location Master"
      description="Standalone locations (wards / areas)."
      apiPath="/masters/location"
      idKey="locationId"
      searchKeys={["locationName"]}
      columns={[
        { key: "locationName", label: "Location Name" },
        { key: "remarks", label: "Remarks" },
      ]}
      formFields={[
        { name: "locationName", label: "Location Name", type: "text", required: true },
        { name: "remarks", label: "Remarks", type: "textarea" },
      ]}
      emptyRecord={{ locationName: "", remarks: "" }}
    />
  );
}
