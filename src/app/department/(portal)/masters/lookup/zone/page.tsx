"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { ZoneMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_zone` (see tbl_scripts.txt)
export default function ZoneMasterPage() {
  return (
    <GenericMasterPage<ZoneMaster>
      title="Zone Master"
      description="Backed by the `tbl_zone` table."
      apiPath="/masters/ZoneMaster"
      idKey="zoneCode"
      searchKeys={["zoneCode", "zoneName", "zoneNameRL"]}
      columns={[
        { key: "zoneCode", label: "ZoneCode" },
        { key: "zoneName", label: "ZoneName" },
        { key: "zoneNameRL", label: "ZoneNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "zoneCode", label: "ZoneCode (unique code)", type: "text", required: true },
        { name: "zoneName", label: "ZoneName", type: "text" },
        { name: "zoneNameRL", label: "ZoneNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ zoneCode: "", zoneName: "", zoneNameRL: "" }}
    />
  );
}
