"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { Address } from "@/types/department-portal";

export default function AddressMasterPage() {
  return (
    <GenericMasterPage<Address>
      title="Address Master"
      description="Addresses linked to an Organization."
      apiPath="/masters/address"
      idKey="addressId"
      searchKeys={["addressLine1", "cityName", "pincode"]}
      columns={[
        { key: "addressLine1", label: "Address Line 1" },
        { key: "cityName", label: "City" },
        { key: "district", label: "District" },
        { key: "state", label: "State" },
        { key: "pincode", label: "Pincode" },
      ]}
      formFields={[
        {
          name: "organizationId",
          label: "Organization",
          type: "select",
          required: true,
          optionsEndpoint: "/masters/organization",
          optionValueKey: "organizationId",
          optionLabelKey: "organizationName",
        },
        { name: "addressLine1", label: "Address Line 1", type: "text", required: true },
        { name: "addressLine2", label: "Address Line 2", type: "text" },
        { name: "location", label: "Location", type: "text" },
        { name: "cityName", label: "City Name", type: "text" },
        { name: "cityCode", label: "City Code", type: "text" },
        { name: "tahsil", label: "Tahsil", type: "text" },
        { name: "district", label: "District", type: "text" },
        { name: "state", label: "State", type: "text" },
        { name: "country", label: "Country", type: "text" },
        { name: "pincode", label: "Pincode", type: "text" },
      ]}
      emptyRecord={{ organizationId: 1, addressLine1: "", pincode: "" }}
    />
  );
}
