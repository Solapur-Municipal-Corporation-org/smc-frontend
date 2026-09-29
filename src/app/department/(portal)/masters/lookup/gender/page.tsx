"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { GenderMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_gender` (see tbl_scripts.txt)
export default function GenderMasterPage() {
  return (
    <GenericMasterPage<GenderMaster>
      title="Gender Master"
      description="Backed by the `tbl_gender` table."
      apiPath="/masters/GenderMaster"
      idKey="titleCode"
      searchKeys={["titleCode", "title", "titleRL", "genderName", "genderNameRL"]}
      columns={[
        { key: "titleCode", label: "TitleCode" },
        { key: "title", label: "Title" },
        { key: "titleRL", label: "TitleRL" },
        { key: "genderName", label: "GenderName" },
        { key: "genderNameRL", label: "GenderNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "titleCode", label: "TitleCode (unique code)", type: "text", required: true },
        { name: "title", label: "Title", type: "text" },
        { name: "titleRL", label: "TitleRL", type: "text" },
        { name: "genderName", label: "GenderName", type: "text" },
        { name: "genderNameRL", label: "GenderNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ titleCode: "", title: "", titleRL: "", genderName: "", genderNameRL: "" }}
    />
  );
}
