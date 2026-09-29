"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { TitleMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_tit` (see tbl_scripts.txt)
export default function TitleMasterPage() {
  return (
    <GenericMasterPage<TitleMaster>
      title="Title Master"
      description="Backed by the `tbl_tit` table."
      apiPath="/masters/TitleMaster"
      idKey="titleCode"
      searchKeys={["titleCode", "title", "titleRL"]}
      columns={[
        { key: "titleCode", label: "TitleCode" },
        { key: "title", label: "Title" },
        { key: "titleRL", label: "TitleRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "titleCode", label: "TitleCode (unique code)", type: "text", required: true },
        { name: "title", label: "Title", type: "text" },
        { name: "titleRL", label: "TitleRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ titleCode: "", title: "", titleRL: "" }}
    />
  );
}
