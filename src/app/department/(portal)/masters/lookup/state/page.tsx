"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { StateMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_state` (see tbl_scripts.txt)
export default function StateMasterPage() {
  return (
    <GenericMasterPage<StateMaster>
      title="State Master"
      description="Backed by the `tbl_state` table."
      apiPath="/masters/StateMaster"
      idKey="satateCode"
      searchKeys={["satateCode", "satateName", "satateNameRL"]}
      columns={[
        { key: "satateCode", label: "SatateCode" },
        { key: "satateName", label: "SatateName" },
        { key: "satateNameRL", label: "SatateNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "satateCode", label: "SatateCode (unique code)", type: "text", required: true },
        { name: "satateName", label: "SatateName", type: "text" },
        { name: "satateNameRL", label: "SatateNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ satateCode: "", satateName: "", satateNameRL: "" }}
    />
  );
}
