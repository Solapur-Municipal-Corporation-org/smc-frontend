"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { CityMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_city` (see tbl_scripts.txt)
export default function CityMasterPage() {
  return (
    <GenericMasterPage<CityMaster>
      title="City Master"
      description="Backed by the `tbl_city` table."
      apiPath="/masters/CityMaster"
      idKey="cityCode"
      searchKeys={["cityCode", "cityName", "cityNameRL"]}
      columns={[
        { key: "cityCode", label: "CityCode" },
        { key: "cityName", label: "CityName" },
        { key: "cityNameRL", label: "CityNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "cityCode", label: "CityCode (unique code)", type: "text", required: true },
        { name: "cityName", label: "CityName", type: "text" },
        { name: "cityNameRL", label: "CityNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ cityCode: "", cityName: "", cityNameRL: "" }}
    />
  );
}
