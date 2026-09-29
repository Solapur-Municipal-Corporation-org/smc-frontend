"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { BankMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_bank` (see tbl_scripts.txt)
export default function BankMasterPage() {
  return (
    <GenericMasterPage<BankMaster>
      title="Bank Master"
      description="Backed by the `tbl_bank` table. Each row is one branch — add the same Bank Name again with a different Branch Code/Name/IFSC for another branch of the same bank."
      apiPath="/masters/BankMaster"
      idKey="bankCode"
      searchKeys={["bankCode", "bankName", "branchName", "ifscCode"]}
      columns={[
        { key: "bankCode", label: "BankCode" },
        { key: "bankName", label: "BankName" },
        { key: "branchCode", label: "BranchCode" },
        { key: "branchName", label: "BranchName" },
        { key: "ifscCode", label: "IFSC Code" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "bankCode", label: "BankCode (unique per branch, e.g. SBI-001)", type: "text", required: true },
        { name: "bankName", label: "BankName", type: "text", required: true },
        { name: "branchCode", label: "BranchCode", type: "text", required: true },
        { name: "branchName", label: "BranchName", type: "text", required: true },
        { name: "ifscCode", label: "IFSC Code", type: "text", required: true },
        { name: "bankNameRL", label: "BankNameRL (regional language name)", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ bankCode: "", bankName: "", branchCode: "", branchName: "", ifscCode: "", bankNameRL: "" }}
    />
  );
}
