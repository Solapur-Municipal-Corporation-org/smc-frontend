"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { WardMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_ward` (see tbl_scripts.txt)
export default function WardMasterPage() {
  return (
    <GenericMasterPage<WardMaster>
      title="Ward Master"
      description="Backed by the `tbl_ward` table."
      apiPath="/masters/WardMaster"
      idKey="wardCode"
      searchKeys={["wardCode", "wardName", "wardNameRL"]}
      columns={[
        { key: "wardCode", label: "WardCode" },
        { key: "wardName", label: "WardName" },
        { key: "wardNameRL", label: "WardNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "wardCode", label: "WardCode (unique code)", type: "text", required: true },
        { name: "wardName", label: "WardName", type: "text" },
        { name: "wardNameRL", label: "WardNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ wardCode: "", wardName: "", wardNameRL: "" }}
    />
  );
}
