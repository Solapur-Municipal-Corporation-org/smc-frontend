"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { Holiday } from "@/types/department-portal";

export default function HolidayMasterPage() {
  return (
    <GenericMasterPage<Holiday>
      title="Holiday Master"
      description="Municipal holiday calendar, linked to a Financial Year."
      apiPath="/masters/holiday"
      idKey="holidayId"
      searchKeys={["festivalName"]}
      columns={[
        { key: "festivalName", label: "Festival / Holiday" },
        { key: "date", label: "Date" },
        { key: "financialYearId", label: "Financial Year Id" },
        { key: "createdBy", label: "Created By" },
      ]}
      formFields={[
        { name: "festivalName", label: "Festival Name", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        {
          name: "financialYearId",
          label: "Financial Year",
          type: "select",
          required: true,
          optionsEndpoint: "/masters/financialyear",
          optionValueKey: "financialYearId",
          optionLabelKey: "financialYearName",
        },
        { name: "createdBy", label: "Created By", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" },
      ]}
      emptyRecord={{ festivalName: "", financialYearId: 1 }}
    />
  );
}
