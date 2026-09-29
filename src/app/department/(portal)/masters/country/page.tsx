"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { Country } from "@/types/department-portal";

export default function CountryMasterPage() {
  return (
    <GenericMasterPage<Country>
      title="Country Master"
      description="Countries, used by the State master."
      apiPath="/masters/country"
      idKey="countryId"
      searchKeys={["countryName", "mobileCode"]}
      columns={[
        { key: "countryName", label: "Country Name" },
        { key: "mobileCode", label: "Mobile Code" },
      ]}
      formFields={[
        { name: "countryName", label: "Country Name", type: "text", required: true },
        { name: "mobileCode", label: "Mobile Code", type: "text" },
      ]}
      emptyRecord={{ countryName: "", mobileCode: "+91" }}
    />
  );
}
