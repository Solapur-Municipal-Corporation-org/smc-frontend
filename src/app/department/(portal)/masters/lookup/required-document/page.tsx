"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { RequiredDocumentMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_dc` (see tbl_scripts.txt)
export default function RequiredDocumentMasterPage() {
  return (
    <GenericMasterPage<RequiredDocumentMaster>
      title="RequiredDocument Master"
      description="Backed by the `tbl_dc` table."
      apiPath="/masters/RequiredDocumentMaster"
      idKey="docCode"
      searchKeys={["docCode", "serCode", "docName", "docNameRL"]}
      columns={[
        { key: "docCode", label: "DocCode" },
        { key: "serCode", label: "SerCode" },
        { key: "docName", label: "DocName" },
        { key: "docNameRL", label: "DocNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "docCode", label: "DocCode (unique code)", type: "text", required: true },
        { name: "serCode", label: "SerCode", type: "text" },
        { name: "docName", label: "DocName", type: "text" },
        { name: "docNameRL", label: "DocNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ docCode: "", serCode: "", docName: "", docNameRL: "" }}
    />
  );
}
