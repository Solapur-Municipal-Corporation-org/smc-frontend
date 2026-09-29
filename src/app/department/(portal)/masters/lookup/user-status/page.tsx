"use client";

import GenericMasterPage from "@/components/department/GenericMasterPage";
import { UserStatusMaster } from "@/types/department-legacy-masters";

// Maps to SQL table `tbl_ust` (see tbl_scripts.txt)
export default function UserStatusMasterPage() {
  return (
    <GenericMasterPage<UserStatusMaster>
      title="UserStatus Master"
      description="Backed by the `tbl_ust` table."
      apiPath="/masters/UserStatusMaster"
      idKey="userCode"
      searchKeys={["userCode", "userName", "userNameRL"]}
      columns={[
        { key: "userCode", label: "UserCode" },
        { key: "userName", label: "UserName" },
        { key: "userNameRL", label: "UserNameRL" },
        { key: "remarks", label: "Remarks" }
      ]}
      formFields={[
        { name: "userCode", label: "UserCode (unique code)", type: "text", required: true },
        { name: "userName", label: "UserName", type: "text" },
        { name: "userNameRL", label: "UserNameRL", type: "text" },
        { name: "remarks", label: "Remarks", type: "textarea" }
      ]}
      emptyRecord={{ userCode: "", userName: "", userNameRL: "" }}
    />
  );
}
