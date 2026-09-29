"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { OrgMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_org` (see tbl_scripts.txt)
export default function OrgMasterPage() {
  return (
    <GenericMasterPage<OrgMaster>
      title="Org Master"
      description="Backed by the `tbl_org` table."
      apiPath="/masters/OrgMaster"
      idKey="orgCode"
      searchKeys={["orgCode", "orgName", "orgNameRL", "hoCode", "printHead"]}
      columns={[
        { key: "orgCode", label: "OrgCode" },
        { key: "orgName", label: "OrgName" },
        { key: "orgNameRL", label: "OrgNameRL" },
        { key: "hoCode", label: "HOCode" },
        { key: "printHead", label: "PrintHead" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "orgCode", label: "OrgCode (unique code)", type: "text", required: true },
        { name: "orgName", label: "OrgName", type: "text" },
        { name: "orgNameRL", label: "OrgNameRL", type: "text" },
        { name: "hoCode", label: "HOCode", type: "text" },
        { name: "printHead", label: "PrintHead", type: "text" },
        { name: "printHeadRL", label: "PrintHeadRL", type: "text" },
        { name: "offFlatRoom", label: "OffFlatRoom", type: "text" },
        { name: "offFloor", label: "OffFloor", type: "text" },
        { name: "offBuilding", label: "OffBuilding", type: "text" },
        { name: "offBlock", label: "OffBlock", type: "text" },
        { name: "offStreet", label: "OffStreet", type: "text" },
        { name: "offLandmark", label: "OffLandmark", type: "text" },
        { name: "offCityCode", label: "OffCityCode", type: "text" },
        { name: "offTahashil", label: "OffTahashil", type: "text" },
        { name: "offDistrict", label: "OffDistrict", type: "text" },
        { name: "offStateCode", label: "OffStateCode", type: "text" },
        { name: "offCountryCode", label: "OffCountryCode", type: "text" },
        { name: "offPINCode", label: "OffPINCode", type: "text" },
        { name: "offAddress", label: "OffAddress", type: "text" },
        { name: "officerName", label: "OfficerName", type: "text" },
        { name: "offTelNo1", label: "OffTelNo1", type: "text" },
        { name: "offTelNo2", label: "OffTelNo2", type: "text" },
        { name: "offFaxNo", label: "OffFaxNo", type: "text" },
        { name: "offEmailID", label: "OffEmailID", type: "text" },
        { name: "internetURL", label: "InternetURL", type: "text" },
        { name: "defolt", label: "Defolt", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ orgCode: "", orgName: "", orgNameRL: "", hoCode: "", printHead: "", printHeadRL: "", offFlatRoom: "", offFloor: "", offBuilding: "", offBlock: "", offStreet: "", offLandmark: "", offCityCode: "", offTahashil: "", offDistrict: "", offStateCode: "", offCountryCode: "", offPINCode: "", offAddress: "", officerName: "", offTelNo1: "", offTelNo2: "", offFaxNo: "", offEmailID: "", internetURL: "", defolt: "" }}
    />
  );
}
