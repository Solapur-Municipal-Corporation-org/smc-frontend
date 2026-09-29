"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { CountryMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_ctr` (see tbl_scripts.txt)
export default function CountryMasterPage() {
  return (
    <GenericMasterPage<CountryMaster>
      title="Country Master"
      description="Backed by the `tbl_ctr` table."
      apiPath="/masters/CountryMaster"
      idKey="contryCode"
      searchKeys={["contryCode", "contryName", "contryNameRL", "contTelCode", "panDigits"]}
      columns={[
        { key: "contryCode", label: "ContryCode" },
        { key: "contryName", label: "ContryName" },
        { key: "contryNameRL", label: "ContryNameRL" },
        { key: "contTelCode", label: "ContTelCode" },
        { key: "panDigits", label: "PANDigits" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "contryCode", label: "ContryCode (unique code)", type: "text", required: true },
        { name: "contryName", label: "ContryName", type: "text" },
        { name: "contryNameRL", label: "ContryNameRL", type: "text" },
        { name: "contTelCode", label: "ContTelCode", type: "text" },
        { name: "panDigits", label: "PANDigits", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ contryCode: "", contryName: "", contryNameRL: "", contTelCode: "", panDigits: "" }}
    />
  );
}
