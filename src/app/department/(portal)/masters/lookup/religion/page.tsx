"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { ReligionMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_rel` (see tbl_scripts.txt)
export default function ReligionMasterPage() {
  return (
    <GenericMasterPage<ReligionMaster>
      title="Religion Master"
      description="Backed by the `tbl_rel` table."
      apiPath="/masters/ReligionMaster"
      idKey="religenCode"
      searchKeys={["religenCode", "religenName", "religenNameRL"]}
      columns={[
        { key: "religenCode", label: "ReligenCode" },
        { key: "religenName", label: "ReligenName" },
        { key: "religenNameRL", label: "ReligenNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "religenCode", label: "ReligenCode (unique code)", type: "text", required: true },
        { name: "religenName", label: "ReligenName", type: "text" },
        { name: "religenNameRL", label: "ReligenNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ religenCode: "", religenName: "", religenNameRL: "" }}
    />
  );
}
