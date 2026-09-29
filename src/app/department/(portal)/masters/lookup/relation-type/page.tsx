"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { RelationTypeMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_relt` (see tbl_scripts.txt)
export default function RelationTypeMasterPage() {
  return (
    <GenericMasterPage<RelationTypeMaster>
      title="RelationType Master"
      description="Backed by the `tbl_relt` table."
      apiPath="/masters/RelationTypeMaster"
      idKey="relCode"
      searchKeys={["relCode", "relation", "relationRL"]}
      columns={[
        { key: "relCode", label: "RelCode" },
        { key: "relation", label: "Relation" },
        { key: "relationRL", label: "RelationRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "relCode", label: "RelCode (unique code)", type: "text", required: true },
        { name: "relation", label: "Relation", type: "text" },
        { name: "relationRL", label: "RelationRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ relCode: "", relation: "", relationRL: "" }}
    />
  );
}
