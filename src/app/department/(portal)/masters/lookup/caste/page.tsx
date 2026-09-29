"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { CasteMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_cast` (see tbl_scripts.txt)
export default function CasteMasterPage() {
  return (
    <GenericMasterPage<CasteMaster>
      title="Caste Master"
      description="Backed by the `tbl_cast` table."
      apiPath="/masters/CasteMaster"
      idKey="castCode"
      searchKeys={["castCode", "castName", "castNameRL"]}
      columns={[
        { key: "castCode", label: "CastCode" },
        { key: "castName", label: "CastName" },
        { key: "castNameRL", label: "CastNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "castCode", label: "CastCode (unique code)", type: "text", required: true },
        { name: "castName", label: "CastName", type: "text" },
        { name: "castNameRL", label: "CastNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ castCode: "", castName: "", castNameRL: "" }}
    />
  );
}
