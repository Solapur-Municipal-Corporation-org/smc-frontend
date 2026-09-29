"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { TahsilMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_tahl` (see tbl_scripts.txt)
export default function TahsilMasterPage() {
  return (
    <GenericMasterPage<TahsilMaster>
      title="Tahsil Master"
      description="Backed by the `tbl_tahl` table."
      apiPath="/masters/TahsilMaster"
      idKey="tahashilCode"
      searchKeys={["tahashilCode", "tahashilName", "tahashilNameRL"]}
      columns={[
        { key: "tahashilCode", label: "TahashilCode" },
        { key: "tahashilName", label: "TahashilName" },
        { key: "tahashilNameRL", label: "TahashilNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "tahashilCode", label: "TahashilCode (unique code)", type: "text", required: true },
        { name: "tahashilName", label: "TahashilName", type: "text" },
        { name: "tahashilNameRL", label: "TahashilNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ tahashilCode: "", tahashilName: "", tahashilNameRL: "" }}
    />
  );
}
