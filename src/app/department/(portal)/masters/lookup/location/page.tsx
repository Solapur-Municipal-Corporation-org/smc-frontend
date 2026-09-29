"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { LocationMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_location` (see tbl_scripts.txt)
export default function LocationMasterPage() {
  return (
    <GenericMasterPage<LocationMaster>
      title="Location Master"
      description="Backed by the `tbl_location` table."
      apiPath="/masters/LocationMaster"
      idKey="locCode"
      searchKeys={["locCode", "locName", "locNameRL"]}
      columns={[
        { key: "locCode", label: "LocCode" },
        { key: "locName", label: "LocName" },
        { key: "locNameRL", label: "LocNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "locCode", label: "LocCode (unique code)", type: "text", required: true },
        { name: "locName", label: "LocName", type: "text" },
        { name: "locNameRL", label: "LocNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ locCode: "", locName: "", locNameRL: "" }}
    />
  );
}
