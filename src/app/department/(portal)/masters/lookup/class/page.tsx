"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { ClassMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_class` (see tbl_scripts.txt)
export default function ClassMasterPage() {
  return (
    <GenericMasterPage<ClassMaster>
      title="Class Master"
      description="Backed by the `tbl_class` table."
      apiPath="/masters/ClassMaster"
      idKey="classCode"
      searchKeys={["classCode", "className", "classNameRL", "totalSheets", "apprSheets"]}
      columns={[
        { key: "classCode", label: "ClassCode" },
        { key: "className", label: "ClassName" },
        { key: "classNameRL", label: "ClassNameRL" },
        { key: "totalSheets", label: "TotalSheets" },
        { key: "apprSheets", label: "ApprSheets" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "classCode", label: "ClassCode (unique code)", type: "text", required: true },
        { name: "className", label: "ClassName", type: "text" },
        { name: "classNameRL", label: "ClassNameRL", type: "text" },
        { name: "totalSheets", label: "TotalSheets", type: "number" },
        { name: "apprSheets", label: "ApprSheets", type: "number" },
        { name: "goverQuota", label: "GoverQuota", type: "number" },
        { name: "managQuota", label: "ManagQuota", type: "number" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ classCode: "", className: "", classNameRL: "", totalSheets: undefined, apprSheets: undefined, goverQuota: undefined, managQuota: undefined }}
    />
  );
}
