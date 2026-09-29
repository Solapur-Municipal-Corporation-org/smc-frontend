"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { BloodGroupMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_bloodgrp` (see tbl_scripts.txt)
export default function BloodGroupMasterPage() {
  return (
    <GenericMasterPage<BloodGroupMaster>
      title="BloodGroup Master"
      description="Backed by the `tbl_bloodgrp` table."
      apiPath="/masters/BloodGroupMaster"
      idKey="bldGrpCode"
      searchKeys={["bldGrpCode", "bldGrpName", "bldGrpNameRL"]}
      columns={[
        { key: "bldGrpCode", label: "BldGrpCode" },
        { key: "bldGrpName", label: "BldGrpName" },
        { key: "bldGrpNameRL", label: "BldGrpNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "bldGrpCode", label: "BldGrpCode (unique code)", type: "text", required: true },
        { name: "bldGrpName", label: "BldGrpName", type: "text" },
        { name: "bldGrpNameRL", label: "BldGrpNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ bldGrpCode: "", bldGrpName: "", bldGrpNameRL: "" }}
    />
  );
}
