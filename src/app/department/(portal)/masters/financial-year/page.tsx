"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { FinancialYear } from "@/types/department-portal";

export default function FinancialYearMasterPage() {
  return (
    <GenericMasterPage<FinancialYear>
      title="Financial Year Master"
      description="Financial years, used by the Holiday master and Employee Leave Balance."
      apiPath="/masters/financialyear"
      idKey="financialYearId"
      searchKeys={["financialYearName"]}
      columns={[
        { key: "financialYearName", label: "Financial Year" },
        { key: "remarks", label: "Remarks" },
      ]}
      formFields={[
        { name: "financialYearName", label: "Financial Year (e.g. 2026-27)", type: "text", required: true },
        { name: "remarks", label: "Remarks", type: "textarea" },
      ]}
      emptyRecord={{ financialYearName: "", remarks: "" }}
    />
  );
}
