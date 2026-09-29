"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { OccupationMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_occu` (see tbl_scripts.txt)
export default function OccupationMasterPage() {
  return (
    <GenericMasterPage<OccupationMaster>
      title="Occupation Master"
      description="Backed by the `tbl_occu` table."
      apiPath="/masters/OccupationMaster"
      idKey="occupCode"
      searchKeys={["occupCode", "occupName", "occupNameRL"]}
      columns={[
        { key: "occupCode", label: "OccupCode" },
        { key: "occupName", label: "OccupName" },
        { key: "occupNameRL", label: "OccupNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "occupCode", label: "OccupCode (unique code)", type: "text", required: true },
        { name: "occupName", label: "OccupName", type: "text" },
        { name: "occupNameRL", label: "OccupNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ occupCode: "", occupName: "", occupNameRL: "" }}
    />
  );
}
