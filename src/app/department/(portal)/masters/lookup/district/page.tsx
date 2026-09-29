"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { DistrictMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_dst` (see tbl_scripts.txt)
export default function DistrictMasterPage() {
  return (
    <GenericMasterPage<DistrictMaster>
      title="District Master"
      description="Backed by the `tbl_dst` table."
      apiPath="/masters/DistrictMaster"
      idKey="destCode"
      searchKeys={["destCode", "destName", "destNameRL"]}
      columns={[
        { key: "destCode", label: "DestCode" },
        { key: "destName", label: "DestName" },
        { key: "destNameRL", label: "DestNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "destCode", label: "DestCode (unique code)", type: "text", required: true },
        { name: "destName", label: "DestName", type: "text" },
        { name: "destNameRL", label: "DestNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ destCode: "", destName: "", destNameRL: "" }}
    />
  );
}
