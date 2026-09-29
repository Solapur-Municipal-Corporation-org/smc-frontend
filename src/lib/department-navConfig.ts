export interface NavLink {
  label: string;
  labelMr: string;
  href: string; // relative to /dashboard/[deptId]
}

export interface NavGroup {
  key: "masters" | "lookupMasters" | "transactions" | "reports";
  label: string;
  labelMr: string;
  links: NavLink[];
}

/**
 * Sidebar structure shared by every department dashboard.
 * "Organization Master" is fully built (CRUD reference implementation);
 * remaining links route to their module's page, to be built out next.
 *
 * Each entry carries an English (`label`) and Marathi (`labelMr`) name so
 * the sidebar can switch language via the EN/MR toggle.
 */
export const navGroups: NavGroup[] = [
  {
    key: "masters",
    label: "Masters",
    labelMr: "मास्टर्स",
    links: [
      { label: "Organization Master", labelMr: "संस्था मास्टर", href: "masters/organization" },
      { label: "Department Master", labelMr: "विभाग मास्टर", href: "masters/department" },
      { label: "Service Master", labelMr: "सेवा मास्टर", href: "masters/service" },
      { label: "User Master", labelMr: "वापरकर्ता मास्टर", href: "masters/user" },
      { label: "Country Master", labelMr: "देश मास्टर", href: "masters/country" },
      { label: "State Master", labelMr: "राज्य मास्टर", href: "masters/state" },
      { label: "District Master", labelMr: "जिल्हा मास्टर", href: "masters/district" },
      { label: "Tahsil Master", labelMr: "तहसील मास्टर", href: "masters/tahsil" },
      { label: "City Master", labelMr: "शहर मास्टर", href: "masters/city" },
      { label: "Location Master", labelMr: "स्थान मास्टर", href: "masters/location" },
      { label: "Address Master", labelMr: "पत्ता मास्टर", href: "masters/address" },
      { label: "Financial Year Master", labelMr: "आर्थिक वर्ष मास्टर", href: "masters/financial-year" },
      { label: "Holiday Master", labelMr: "सुट्टी मास्टर", href: "masters/holiday" },
      { label: "Employee Master", labelMr: "कर्मचारी मास्टर", href: "masters/employee" },
      { label: "Employee Leave Balance", labelMr: "कर्मचारी रजा शिल्लक", href: "masters/leave-balance" },
    ],
  },
  {
    key: "lookupMasters",
    label: "Lookup Masters",
    labelMr: "लूकअप मास्टर्स",
    links: [
      { label: "Blood Group Master", labelMr: "रक्तगट मास्टर", href: "masters/lookup/blood-group" },
      { label: "Bank Master", labelMr: "बँक मास्टर", href: "masters/lookup/bank" },
      { label: "Class Master", labelMr: "वर्ग मास्टर", href: "masters/lookup/class" },
      { label: "Caste Master", labelMr: "जात मास्टर", href: "masters/lookup/caste" },
      { label: "Country Master (Legacy)", labelMr: "देश मास्टर (जुने)", href: "masters/lookup/country" },
      { label: "City Master (Legacy)", labelMr: "शहर मास्टर (जुने)", href: "masters/lookup/city" },
      { label: "District Master (Legacy)", labelMr: "जिल्हा मास्टर (जुने)", href: "masters/lookup/district" },
      { label: "Education Type Master", labelMr: "शिक्षण प्रकार मास्टर", href: "masters/lookup/education-type" },
      { label: "Gender Master", labelMr: "लिंग मास्टर", href: "masters/lookup/gender" },
      { label: "Location Master (Legacy)", labelMr: "स्थान मास्टर (जुने)", href: "masters/lookup/location" },
      { label: "Marital Status Master", labelMr: "वैवाहिक स्थिती मास्टर", href: "masters/lookup/marital-status" },
      { label: "Occupation Master", labelMr: "व्यवसाय मास्टर", href: "masters/lookup/occupation" },
      { label: "Required Document Master", labelMr: "आवश्यक दस्तऐवज मास्टर", href: "masters/lookup/required-document" },
      { label: "Religion Master", labelMr: "धर्म मास्टर", href: "masters/lookup/religion" },
      { label: "Relation Type Master", labelMr: "नाते प्रकार मास्टर", href: "masters/lookup/relation-type" },
      { label: "State Master (Legacy)", labelMr: "राज्य मास्टर (जुने)", href: "masters/lookup/state" },
      { label: "Tahsil Master (Legacy)", labelMr: "तहसील मास्टर (जुने)", href: "masters/lookup/tahsil" },
      { label: "Title Master", labelMr: "उपाधी मास्टर", href: "masters/lookup/title" },
      { label: "User Status Master", labelMr: "वापरकर्ता स्थिती मास्टर", href: "masters/lookup/user-status" },
      { label: "Ward Master", labelMr: "प्रभाग मास्टर", href: "masters/lookup/ward" },
      { label: "Zone Master", labelMr: "क्षेत्र मास्टर", href: "masters/lookup/zone" },
      { label: "Organization Master (Legacy tbl_org)", labelMr: "संस्था मास्टर (जुने tbl_org)", href: "masters/lookup/org" },
    ],
  },
  {
    key: "transactions",
    label: "Transactions",
    labelMr: "व्यवहार",
    links: [
      { label: "New Application", labelMr: "नवीन अर्ज", href: "transactions/applications/new" },
      { label: "Application Tracking", labelMr: "अर्ज मागोवा", href: "transactions/applications" },
      { label: "Document Upload", labelMr: "दस्तऐवज अपलोड", href: "transactions/documents" },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    labelMr: "अहवाल",
    links: [
      { label: "Service-wise Report", labelMr: "सेवा-निहाय अहवाल", href: "reports/service-wise" },
      { label: "Application Status Report", labelMr: "अर्ज स्थिती अहवाल", href: "reports/application-status" },
      { label: "Audit Log", labelMr: "लेखापरीक्षण नोंद", href: "reports/audit-log" },
      { label: "Dashboard Charts", labelMr: "डॅशबोर्ड तक्ते", href: "reports/charts" },
    ],
  },
];
