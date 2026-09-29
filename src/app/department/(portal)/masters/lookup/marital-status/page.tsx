"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { MaritalStatusMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_mrs` (see tbl_scripts.txt)
export default function MaritalStatusMasterPage() {
  return (
    <GenericMasterPage<MaritalStatusMaster>
      title="MaritalStatus Master"
      description="Backed by the `tbl_mrs` table."
      apiPath="/masters/MaritalStatusMaster"
      idKey="marrStaCode"
      searchKeys={["marrStaCode", "marrStaName", "marrStaNameRL"]}
      columns={[
        { key: "marrStaCode", label: "MarrStaCode" },
        { key: "marrStaName", label: "MarrStaName" },
        { key: "marrStaNameRL", label: "MarrStaNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "marrStaCode", label: "MarrStaCode (unique code)", type: "text", required: true },
        { name: "marrStaName", label: "MarrStaName", type: "text" },
        { name: "marrStaNameRL", label: "MarrStaNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ marrStaCode: "", marrStaName: "", marrStaNameRL: "" }}
    />
  );
}
