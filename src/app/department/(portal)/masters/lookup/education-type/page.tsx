"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { EducationTypeMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_edu` (see tbl_scripts.txt)
export default function EducationTypeMasterPage() {
  return (
    <GenericMasterPage<EducationTypeMaster>
      title="EducationType Master"
      description="Backed by the `tbl_edu` table."
      apiPath="/masters/EducationTypeMaster"
      idKey="eduCode"
      searchKeys={["eduCode", "eduName", "eduNameRL"]}
      columns={[
        { key: "eduCode", label: "EduCode" },
        { key: "eduName", label: "EduName" },
        { key: "eduNameRL", label: "EduNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "eduCode", label: "EduCode (unique code)", type: "text", required: true },
        { name: "eduName", label: "EduName", type: "text" },
        { name: "eduNameRL", label: "EduNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ eduCode: "", eduName: "", eduNameRL: "" }}
    />
  );
}
