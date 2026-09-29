"use client";

import { useEffect, useState } from "react";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiFile,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import api from "@/lib/department-api";
import { getApiErrorMessage } from "@/lib/department-api";
import {
  Employee,
  EmployeeAddress,
  EmployeeBankDetail,
  EmployeeSalary,
  Education,
  Family,
  EmployeeDocument,
  Department,
} from "@/types/department-portal";
import { BankMaster } from "@/types/department-legacy-masters";

interface Step {
  key: string;
  label: string;
}

// Order: Employee -> Address (Permanent + Current) -> Education -> Bank
// -> Salary -> Family -> Documents (last, with image/PDF upload).
const STEPS: Step[] = [
  { key: "employee", label: "Employee" },
  { key: "address", label: "Address" },
  { key: "education", label: "Education" },
  { key: "bank", label: "Bank" },
  { key: "salary", label: "Salary" },
  { key: "family", label: "Family" },
  { key: "documents", label: "Documents" },
];

interface WizardState {
  employee: Partial<Employee>;
  address: Partial<EmployeeAddress>;
  bankDetail: Partial<EmployeeBankDetail>;
  salary: Partial<EmployeeSalary>;
  education: Partial<Education>[];
  family: Partial<Family>[];
  documents: Partial<EmployeeDocument>[];
}

const emptyState: WizardState = {
  employee: { employeeCode: "", firstNameEnglish: "", lastNameEnglish: "", isActive: true, physicallyHandicapped: false },
  address: { sameAsPermanent: false },
  bankDetail: {},
  salary: {},
  education: [],
  family: [],
  documents: [],
};

// Maps each Permanent* address field to its Current* equivalent, used to mirror values
// once when "Same as Permanent Address" is checked.
const PERMANENT_TO_CURRENT: Record<string, keyof EmployeeAddress> = {
  permanentAddressLine1: "currentAddressLine1",
  permanentAddressLine2: "currentAddressLine2",
  permanentCity: "currentCity",
  permanentTahsil: "currentTahsil",
  permanentDistrict: "currentDistrict",
  permanentState: "currentState",
  permanentCountry: "currentCountry",
  permanentPincode: "currentPincode",
};

// API base without the trailing /api — used to resolve uploaded file URLs, which are
// served as static files from the API host's wwwroot, not under /api.
const FILE_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const resolveFileUrl = (path?: string) => (path ? `${FILE_BASE_URL}${path}` : "");

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_RE = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/;
const IFSC_RE = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
const CURRENT_YEAR = new Date().getFullYear();

function validateEmployee(e: Partial<Employee>): FieldErrors {
  const err: FieldErrors = {};
  if (!e.employeeCode?.trim()) err.employeeCode = "Employee Code is required.";
  if (!e.firstNameEnglish?.trim()) err.firstNameEnglish = "First Name is required.";
  if (!e.lastNameEnglish?.trim()) err.lastNameEnglish = "Last Name is required.";
  if (!e.mobileNumber?.trim()) err.mobileNumber = "Mobile Number is required.";
  else if (!/^\d{10}$/.test(e.mobileNumber.trim())) err.mobileNumber = "Enter a valid 10-digit mobile number.";
  if (!e.gender) err.gender = "Gender is required.";
  if (!e.dob) err.dob = "Date of Birth is required.";
  if (e.mailId && !EMAIL_RE.test(e.mailId.trim())) err.mailId = "Enter a valid email address.";
  if (e.aadharNo && !/^\d{12}$/.test(e.aadharNo.trim())) err.aadharNo = "Aadhar No must be 12 digits.";
  if (e.panNo && !PAN_RE.test(e.panNo.trim())) err.panNo = "Enter a valid PAN (e.g. ABCDE1234F).";
  return err;
}

function validateAddress(a: Partial<EmployeeAddress>): FieldErrors {
  const err: FieldErrors = {};
  if (!a.permanentAddressLine1?.trim()) err.permanentAddressLine1 = "Address Line 1 is required.";
  if (!a.permanentCity?.trim()) err.permanentCity = "City is required.";
  if (!a.permanentState?.trim()) err.permanentState = "State is required.";
  if (!a.permanentPincode?.trim()) err.permanentPincode = "Pincode is required.";
  else if (!/^\d{6}$/.test(a.permanentPincode.trim())) err.permanentPincode = "Enter a valid 6-digit pincode.";

  if (!a.sameAsPermanent) {
    if (!a.currentAddressLine1?.trim()) err.currentAddressLine1 = "Address Line 1 is required.";
    if (!a.currentCity?.trim()) err.currentCity = "City is required.";
    if (!a.currentState?.trim()) err.currentState = "State is required.";
    if (!a.currentPincode?.trim()) err.currentPincode = "Pincode is required.";
    else if (!/^\d{6}$/.test(a.currentPincode.trim())) err.currentPincode = "Enter a valid 6-digit pincode.";
  }
  return err;
}

function validateEducationRow(row: Partial<Education>): FieldErrors {
  const err: FieldErrors = {};
  if (!row.educationName?.trim()) err.educationName = "Required";
  if (!row.boardUniversity?.trim()) err.boardUniversity = "Required";
  if (!row.year?.trim()) err.year = "Required";
  else if (!/^\d{4}$/.test(row.year.trim()) || Number(row.year) < 1950 || Number(row.year) > CURRENT_YEAR)
    err.year = `Enter a valid year (1950–${CURRENT_YEAR}).`;
  if (!row.percentage?.trim()) err.percentage = "Required";
  else {
    const n = Number(row.percentage);
    if (Number.isNaN(n) || n < 0 || n > 100) err.percentage = "Enter 0–100.";
  }
  return err;
}

function validateBank(b: Partial<EmployeeBankDetail>): FieldErrors {
  const err: FieldErrors = {};
  const touched = !!(b.accountNumber?.trim() || b.ifscCode?.trim() || b.bankName?.trim());
  if (!touched) return err; // whole section optional if nothing entered
  if (!b.bankName?.trim()) err.bankName = "Bank Name is required.";
  if (!b.branchName?.trim()) err.branchName = "Branch Name is required.";
  if (!b.accountNumber?.trim()) err.accountNumber = "Account Number is required.";
  if (!b.ifscCode?.trim()) err.ifscCode = "IFSC Code is required.";
  else if (!IFSC_RE.test(b.ifscCode.trim())) err.ifscCode = "Enter a valid IFSC code (e.g. SBIN0001234).";
  return err;
}

function validateFamilyRow(row: Partial<Family>): FieldErrors {
  const err: FieldErrors = {};
  if (!row.relationType?.trim()) err.relationType = "Required";
  if (!row.name?.trim()) err.name = "Required";
  if (row.phoneNumber && !/^\d{10}$/.test(row.phoneNumber.trim())) err.phoneNumber = "10-digit number";
  return err;
}

function validateDocumentRow(row: Partial<EmployeeDocument>): FieldErrors {
  const err: FieldErrors = {};
  if (!row.documentName?.trim()) err.documentName = "Required";
  if (!row.filePath) err.filePath = "Please upload a file for this document.";
  return err;
}

const hasErrors = (e: FieldErrors) => Object.keys(e).length > 0;
const rowsHaveErrors = (rows: FieldErrors[]) => rows.some(hasErrors);

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 mt-1">{message}</p>;
}

interface EmployeeWizardProps {
  employeeId: number | null; // null = create new
  onClose: () => void;
  onSaved: () => void;
}

export default function EmployeeWizard({ employeeId, onClose, onSaved }: EmployeeWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<WizardState>(emptyState);
  const [departments, setDepartments] = useState<Department[]>([]);
  // Bank Master (tbl_bank): one row per branch. Selecting a Bank Name narrows
  // this down to its branches; selecting a Branch Name then auto-fills
  // Branch Code + IFSC Code from the matching row.
  const [bankBranches, setBankBranches] = useState<BankMaster[]>([]);
  const [loading, setLoading] = useState(!!employeeId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingRows, setUploadingRows] = useState<Set<number>>(new Set());

  const [employeeErrors, setEmployeeErrors] = useState<FieldErrors>({});
  const [addressErrors, setAddressErrors] = useState<FieldErrors>({});
  const [bankErrors, setBankErrors] = useState<FieldErrors>({});
  const [educationRowErrors, setEducationRowErrors] = useState<FieldErrors[]>([]);
  const [familyRowErrors, setFamilyRowErrors] = useState<FieldErrors[]>([]);
  const [documentRowErrors, setDocumentRowErrors] = useState<FieldErrors[]>([]);

  useEffect(() => {
    api.get<Department[]>("/department").then((res) => setDepartments(res.data)).catch(() => {});
    api
      .get<BankMaster[]>("/masters/BankMaster")
      .then((res) => setBankBranches(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    api
      .get(`/employee-profile/${employeeId}`)
      .then((res) => {
        const d = res.data;
        setState({
          employee: d.employee || {},
          address: d.address || { sameAsPermanent: false },
          bankDetail: d.bankDetail || {},
          salary: d.salary || {},
          education: d.education || [],
          family: d.family || [],
          documents: d.documents || [],
        });
        setEducationRowErrors((d.education || []).map(() => ({})));
        setFamilyRowErrors((d.family || []).map(() => ({})));
        setDocumentRowErrors((d.documents || []).map(() => ({})));
      })
      .finally(() => setLoading(false));
  }, [employeeId]);

  const setEmployee = (patch: Partial<Employee>) => {
    setState((s) => ({ ...s, employee: { ...s.employee, ...patch } }));
    setEmployeeErrors((prev) => clearFields(prev, patch));
  };
  const setBank = (patch: Partial<EmployeeBankDetail>) => {
    setState((s) => ({ ...s, bankDetail: { ...s.bankDetail, ...patch } }));
    setBankErrors((prev) => clearFields(prev, patch));
  };

  // Distinct bank names for the first dropdown (tbl_bank has one row per branch).
  const bankNames = Array.from(new Set(bankBranches.map((b) => b.bankName).filter(Boolean))) as string[];
  // Branches belonging to whichever bank is currently selected.
  const branchesForSelectedBank = bankBranches.filter((b) => b.bankName === state.bankDetail.bankName);

  // Bank Name changed: clear any branch/IFSC data picked for the previous bank.
  const onBankNameChange = (bankName: string) => {
    setBank({ bankName, branchCode: undefined, branchName: undefined, ifscCode: undefined });
  };
  // Branch Name changed: look up that branch's row and auto-fill Branch Code + IFSC Code.
  const onBranchNameChange = (branchCode: string) => {
    const match = branchesForSelectedBank.find((b) => b.branchCode === branchCode);
    setBank({
      branchCode: match?.branchCode,
      branchName: match?.branchName,
      ifscCode: match?.ifscCode,
    });
  };
  const setSalary = (patch: Partial<EmployeeSalary>) => setState((s) => ({ ...s, salary: { ...s.salary, ...patch } }));

  // Plain field update for Current Address inputs (no mirroring needed here).
  const setAddress = (patch: Partial<EmployeeAddress>) => {
    setState((s) => ({ ...s, address: { ...s.address, ...patch } }));
    setAddressErrors((prev) => clearFields(prev, patch));
  };

  // Permanent Address inputs use this instead: if "Same as Permanent" is already
  // checked, keep the Current Address fields mirrored live as Permanent changes.
  const setPermanentAddress = (patch: Partial<EmployeeAddress>) => {
    setState((s) => {
      const nextAddress: Partial<EmployeeAddress> = { ...s.address, ...patch };
      if (s.address.sameAsPermanent) {
        Object.entries(patch).forEach(([key, value]) => {
          const mirrorKey = PERMANENT_TO_CURRENT[key];
          if (mirrorKey) (nextAddress as any)[mirrorKey] = value;
        });
      }
      return { ...s, address: nextAddress };
    });
    setAddressErrors((prev) => clearFields(prev, patch));
  };

  // "Same as Permanent Address" checkbox — copies Permanent -> Current once when checked.
  const handleSameAsPermanent = (checked: boolean) => {
    setState((s) => {
      const nextAddress: Partial<EmployeeAddress> = { ...s.address, sameAsPermanent: checked };
      if (checked) {
        Object.entries(PERMANENT_TO_CURRENT).forEach(([permanentKey, currentKey]) => {
          (nextAddress as any)[currentKey] = (s.address as any)[permanentKey];
        });
      }
      return { ...s, address: nextAddress };
    });
    if (checked) {
      // Clear any "Current Address required" errors since it's now mirrored.
      setAddressErrors((prev) => {
        const next = { ...prev };
        ["currentAddressLine1", "currentCity", "currentState", "currentPincode"].forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const addRow = <K extends "education" | "family" | "documents">(key: K, row: WizardState[K][number]) => {
    setState((s) => ({ ...s, [key]: [...s[key], row] } as WizardState));
    if (key === "education") setEducationRowErrors((prev) => [...prev, {}]);
    if (key === "family") setFamilyRowErrors((prev) => [...prev, {}]);
    if (key === "documents") setDocumentRowErrors((prev) => [...prev, {}]);
  };

  const updateRow = <K extends "education" | "family" | "documents">(key: K, index: number, patch: Partial<WizardState[K][number]>) => {
    setState((s) => ({
      ...s,
      [key]: s[key].map((row, i) => (i === index ? { ...row, ...patch } : row)),
    } as WizardState));
    const clearFn = (prev: FieldErrors[]) => {
      if (!prev[index] || !hasErrors(prev[index])) return prev;
      const next = [...prev];
      next[index] = clearFields(next[index], patch as Record<string, any>);
      return next;
    };
    if (key === "education") setEducationRowErrors(clearFn);
    if (key === "family") setFamilyRowErrors(clearFn);
    if (key === "documents") setDocumentRowErrors(clearFn);
  };

  const removeRow = <K extends "education" | "family" | "documents">(key: K, index: number) => {
    setState((s) => ({ ...s, [key]: s[key].filter((_, i) => i !== index) } as WizardState));
    const spliceFn = (prev: FieldErrors[]) => prev.filter((_, i) => i !== index);
    if (key === "education") setEducationRowErrors(spliceFn);
    if (key === "family") setFamilyRowErrors(spliceFn);
    if (key === "documents") setDocumentRowErrors(spliceFn);
  };

  // Uploads the selected file for a Documents row, then stores the returned URL/metadata
  // on that row. Works even for a brand-new (unsaved) employee — upload doesn't need an
  // employeeId, it's just associated with the employee when the wizard is saved.
  const handleDocumentFileChange = async (index: number, file: File | null) => {
    if (!file) return;
    setError(null);
    setUploadingRows((prev) => new Set(prev).add(index));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/uploads/employee-document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateRow("documents", index, {
        filePath: res.data.filePath,
        fileName: res.data.fileName,
        contentType: res.data.contentType,
        fileSizeBytes: res.data.sizeBytes,
        documentName: state.documents[index]?.documentName || res.data.fileName,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "File upload failed. Please try a smaller file or a different format (JPG, PNG, GIF, WEBP, PDF).");
    } finally {
      setUploadingRows((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  // Removing a document row also best-effort deletes the uploaded file from disk.
  const removeDocumentRow = (index: number) => {
    const row = state.documents[index];
    if (row?.filePath) {
      api.delete("/uploads/employee-document", { params: { path: row.filePath } }).catch(() => {});
    }
    removeRow("documents", index);
  };

  // Runs the validator for one step and stores its errors; returns true if that step is valid.
  const validateStep = (index: number): boolean => {
    if (index === 0) {
      const errs = validateEmployee(state.employee);
      setEmployeeErrors(errs);
      return !hasErrors(errs);
    }
    if (index === 1) {
      const errs = validateAddress(state.address);
      setAddressErrors(errs);
      return !hasErrors(errs);
    }
    if (index === 2) {
      const rowErrs = state.education.map(validateEducationRow);
      setEducationRowErrors(rowErrs);
      return !rowsHaveErrors(rowErrs);
    }
    if (index === 3) {
      const errs = validateBank(state.bankDetail);
      setBankErrors(errs);
      return !hasErrors(errs);
    }
    if (index === 5) {
      const rowErrs = state.family.map(validateFamilyRow);
      setFamilyRowErrors(rowErrs);
      return !rowsHaveErrors(rowErrs);
    }
    if (index === 6) {
      const rowErrs = state.documents.map(validateDocumentRow);
      setDocumentRowErrors(rowErrs);
      return !rowsHaveErrors(rowErrs);
    }
    return true; // step 4 (Salary) has no mandatory fields
  };

  const stepHasError = (index: number): boolean => {
    if (index === 0) return hasErrors(employeeErrors);
    if (index === 1) return hasErrors(addressErrors);
    if (index === 2) return rowsHaveErrors(educationRowErrors);
    if (index === 3) return hasErrors(bankErrors);
    if (index === 5) return rowsHaveErrors(familyRowErrors);
    if (index === 6) return rowsHaveErrors(documentRowErrors);
    return false;
  };

  const goNext = () => {
    if (!validateStep(stepIndex)) return;
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  };

  const handleSave = async () => {
    setError(null);
    let firstInvalidStep = -1;
    for (let i = 0; i < STEPS.length; i++) {
      const ok = validateStep(i);
      if (!ok && firstInvalidStep === -1) firstInvalidStep = i;
    }
    if (firstInvalidStep !== -1) {
      setStepIndex(firstInvalidStep);
      setError("Please fix the highlighted fields before saving.");
      return;
    }
    if (uploadingRows.size > 0) {
      setError("Please wait for the document upload to finish before saving.");
      setStepIndex(6);
      return;
    }
    setSaving(true);
    const payload = {
      employee: state.employee,
      address: Object.keys(state.address).length ? state.address : null,
      bankDetail: Object.keys(state.bankDetail).length ? state.bankDetail : null,
      salary: Object.keys(state.salary).length ? state.salary : null,
      education: state.education,
      family: state.family,
      documents: state.documents,
    };
    try {
      if (employeeId) {
        await api.put(`/employee-profile/${employeeId}`, payload);
      } else {
        await api.post("/employee-profile", payload);
      }
      onSaved();
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Something went wrong while saving. Please check the form and try again."));
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC5288] disabled:bg-gray-100 disabled:text-gray-500";
  const inputErrCls =
    "w-full px-3 py-2 border border-red-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100 disabled:text-gray-500";
  const fieldCls = (err?: string) => (err ? inputErrCls : inputCls);
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="brand-gradient text-white px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
        <h2 className="font-bold text-base sm:text-lg">{employeeId ? "Edit Employee" : "Add Employee"}</h2>
        {employeeId && (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/15"
          >
            <FiX size={14} /> New Employee
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex overflow-x-auto border-b border-gray-200 px-2 sm:px-4 shrink-0 bg-gray-50">
        {STEPS.map((step, i) => (
          <button
            key={step.key}
            onClick={() => setStepIndex(i)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              i === stepIndex
                ? "border-[#AC5288] text-[#3C1053]"
                : i < stepIndex
                ? "border-transparent text-gray-500"
                : "border-transparent text-gray-400"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
                stepHasError(i)
                  ? "bg-red-100 text-red-600"
                  : i === stepIndex
                  ? "bg-[#AC5288] text-white"
                  : i < stepIndex
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {stepHasError(i) ? "!" : i < stepIndex ? <FiCheck size={12} /> : i + 1}
            </span>
            {step.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
        ) : (
          <>
            {/* Step 0: Employee */}
            {stepIndex === 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Employee Code *</label>
                  <input className={fieldCls(employeeErrors.employeeCode)} value={state.employee.employeeCode || ""} onChange={(e) => setEmployee({ employeeCode: e.target.value })} />
                  <ErrorText message={employeeErrors.employeeCode} />
                </div>
                <div>
                  <label className={labelCls}>Department</label>
                  <select
                    className={inputCls}
                    value={state.employee.departmentId ?? ""}
                    onChange={(e) => setEmployee({ departmentId: Number(e.target.value) || undefined })}
                  >
                    <option value="">Select...</option>
                    {departments.map((d) => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>First Name (English) *</label>
                  <input className={fieldCls(employeeErrors.firstNameEnglish)} value={state.employee.firstNameEnglish || ""} onChange={(e) => setEmployee({ firstNameEnglish: e.target.value })} />
                  <ErrorText message={employeeErrors.firstNameEnglish} />
                </div>
                <div>
                  <label className={labelCls}>First Name (Marathi)</label>
                  <input className={`${inputCls} font-marathi`} value={state.employee.firstNameMarathi || ""} onChange={(e) => setEmployee({ firstNameMarathi: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Last Name (English) *</label>
                  <input className={fieldCls(employeeErrors.lastNameEnglish)} value={state.employee.lastNameEnglish || ""} onChange={(e) => setEmployee({ lastNameEnglish: e.target.value })} />
                  <ErrorText message={employeeErrors.lastNameEnglish} />
                </div>
                <div>
                  <label className={labelCls}>Last Name (Marathi)</label>
                  <input className={`${inputCls} font-marathi`} value={state.employee.lastNameMarathi || ""} onChange={(e) => setEmployee({ lastNameMarathi: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Father Name (English)</label>
                  <input className={inputCls} value={state.employee.fatherNameEnglish || ""} onChange={(e) => setEmployee({ fatherNameEnglish: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Mother Name (English)</label>
                  <input className={inputCls} value={state.employee.motherNameEnglish || ""} onChange={(e) => setEmployee({ motherNameEnglish: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Mobile Number *</label>
                  <input className={fieldCls(employeeErrors.mobileNumber)} maxLength={10} value={state.employee.mobileNumber || ""} onChange={(e) => setEmployee({ mobileNumber: e.target.value.replace(/\D/g, "") })} />
                  <ErrorText message={employeeErrors.mobileNumber} />
                </div>
                <div>
                  <label className={labelCls}>Mail ID</label>
                  <input className={fieldCls(employeeErrors.mailId)} value={state.employee.mailId || ""} onChange={(e) => setEmployee({ mailId: e.target.value })} />
                  <ErrorText message={employeeErrors.mailId} />
                </div>
                <div>
                  <label className={labelCls}>Gender *</label>
                  <select className={fieldCls(employeeErrors.gender)} value={state.employee.gender || ""} onChange={(e) => setEmployee({ gender: e.target.value })}>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ErrorText message={employeeErrors.gender} />
                </div>
                <div>
                  <label className={labelCls}>Blood Group</label>
                  <input className={inputCls} value={state.employee.bloodGroup || ""} onChange={(e) => setEmployee({ bloodGroup: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth *</label>
                  <input type="date" className={fieldCls(employeeErrors.dob)} value={state.employee.dob?.slice(0, 10) || ""} onChange={(e) => setEmployee({ dob: e.target.value })} />
                  <ErrorText message={employeeErrors.dob} />
                </div>
                <div>
                  <label className={labelCls}>Aadhar No</label>
                  <input className={fieldCls(employeeErrors.aadharNo)} maxLength={12} value={state.employee.aadharNo || ""} onChange={(e) => setEmployee({ aadharNo: e.target.value.replace(/\D/g, "") })} />
                  <ErrorText message={employeeErrors.aadharNo} />
                </div>
                <div>
                  <label className={labelCls}>PAN No</label>
                  <input className={fieldCls(employeeErrors.panNo)} maxLength={10} value={state.employee.panNo || ""} onChange={(e) => setEmployee({ panNo: e.target.value.toUpperCase() })} />
                  <ErrorText message={employeeErrors.panNo} />
                </div>
                <div>
                  <label className={labelCls}>Marital Status</label>
                  <select className={inputCls} value={state.employee.maritalStatus || ""} onChange={(e) => setEmployee({ maritalStatus: e.target.value })}>
                    <option value="">Select...</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Occupation</label>
                  <input className={inputCls} placeholder="e.g. Clerk, Engineer, Officer" value={state.employee.occupation || ""} onChange={(e) => setEmployee({ occupation: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                  <input type="checkbox" checked={!!state.employee.physicallyHandicapped} onChange={(e) => setEmployee({ physicallyHandicapped: e.target.checked })} />
                  Physically Handicapped
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                  <input type="checkbox" checked={state.employee.isActive ?? true} onChange={(e) => setEmployee({ isActive: e.target.checked })} />
                  Active
                </label>
              </div>
            )}

            {/* Step 1: Address — Permanent and Current side by side */}
            {stepIndex === 1 && (
              <div className="grid lg:grid-cols-2 gap-6 items-start">
                <div className="border border-gray-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Permanent Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className={labelCls}>Address Line 1 *</label>
                      <input className={fieldCls(addressErrors.permanentAddressLine1)} value={state.address.permanentAddressLine1 || ""} onChange={(e) => setPermanentAddress({ permanentAddressLine1: e.target.value })} />
                      <ErrorText message={addressErrors.permanentAddressLine1} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Address Line 2</label>
                      <input className={inputCls} value={state.address.permanentAddressLine2 || ""} onChange={(e) => setPermanentAddress({ permanentAddressLine2: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>City *</label>
                      <input className={fieldCls(addressErrors.permanentCity)} value={state.address.permanentCity || ""} onChange={(e) => setPermanentAddress({ permanentCity: e.target.value })} />
                      <ErrorText message={addressErrors.permanentCity} />
                    </div>
                    <div>
                      <label className={labelCls}>Tahsil</label>
                      <input className={inputCls} value={state.address.permanentTahsil || ""} onChange={(e) => setPermanentAddress({ permanentTahsil: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>District</label>
                      <input className={inputCls} value={state.address.permanentDistrict || ""} onChange={(e) => setPermanentAddress({ permanentDistrict: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>State *</label>
                      <input className={fieldCls(addressErrors.permanentState)} value={state.address.permanentState || ""} onChange={(e) => setPermanentAddress({ permanentState: e.target.value })} />
                      <ErrorText message={addressErrors.permanentState} />
                    </div>
                    <div>
                      <label className={labelCls}>Country</label>
                      <input className={inputCls} value={state.address.permanentCountry || ""} onChange={(e) => setPermanentAddress({ permanentCountry: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Pincode *</label>
                      <input className={fieldCls(addressErrors.permanentPincode)} maxLength={6} value={state.address.permanentPincode || ""} onChange={(e) => setPermanentAddress({ permanentPincode: e.target.value.replace(/\D/g, "") })} />
                      <ErrorText message={addressErrors.permanentPincode} />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">Current Address</h3>
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!state.address.sameAsPermanent}
                        onChange={(e) => handleSameAsPermanent(e.target.checked)}
                      />
                      Same as Permanent
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className={labelCls}>Address Line 1{!state.address.sameAsPermanent && " *"}</label>
                      <input
                        className={fieldCls(addressErrors.currentAddressLine1)}
                        disabled={!!state.address.sameAsPermanent}
                        value={state.address.currentAddressLine1 || ""}
                        onChange={(e) => setAddress({ currentAddressLine1: e.target.value })}
                      />
                      <ErrorText message={addressErrors.currentAddressLine1} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Address Line 2</label>
                      <input
                        className={inputCls}
                        disabled={!!state.address.sameAsPermanent}
                        value={state.address.currentAddressLine2 || ""}
                        onChange={(e) => setAddress({ currentAddressLine2: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>City{!state.address.sameAsPermanent && " *"}</label>
                      <input
                        className={fieldCls(addressErrors.currentCity)}
                        disabled={!!state.address.sameAsPermanent}
                        value={state.address.currentCity || ""}
                        onChange={(e) => setAddress({ currentCity: e.target.value })}
                      />
                      <ErrorText message={addressErrors.currentCity} />
                    </div>
                    <div>
                      <label className={labelCls}>Tahsil</label>
                      <input
                        className={inputCls}
                        disabled={!!state.address.sameAsPermanent}
                        value={state.address.currentTahsil || ""}
                        onChange={(e) => setAddress({ currentTahsil: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>District</label>
                      <input
                        className={inputCls}
                        disabled={!!state.address.sameAsPermanent}
                        value={state.address.currentDistrict || ""}
                        onChange={(e) => setAddress({ currentDistrict: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>State{!state.address.sameAsPermanent && " *"}</label>
                      <input
                        className={fieldCls(addressErrors.currentState)}
                        disabled={!!state.address.sameAsPermanent}
                        value={state.address.currentState || ""}
                        onChange={(e) => setAddress({ currentState: e.target.value })}
                      />
                      <ErrorText message={addressErrors.currentState} />
                    </div>
                    <div>
                      <label className={labelCls}>Country</label>
                      <input
                        className={inputCls}
                        disabled={!!state.address.sameAsPermanent}
                        value={state.address.currentCountry || ""}
                        onChange={(e) => setAddress({ currentCountry: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Pincode{!state.address.sameAsPermanent && " *"}</label>
                      <input
                        className={fieldCls(addressErrors.currentPincode)}
                        maxLength={6}
                        disabled={!!state.address.sameAsPermanent}
                        value={state.address.currentPincode || ""}
                        onChange={(e) => setAddress({ currentPincode: e.target.value.replace(/\D/g, "") })}
                      />
                      <ErrorText message={addressErrors.currentPincode} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Education — tabular: Education | Board/University | Year of Passing | Percentage */}
            {stepIndex === 2 && (
              <EducationTable
                rows={state.education}
                rowErrors={educationRowErrors}
                onAdd={() => addRow("education", { educationName: "", boardUniversity: "", year: "", percentage: "" })}
                onRemove={(i) => removeRow("education", i)}
                onChange={(i, patch) => updateRow("education", i, patch)}
              />
            )}

            {/* Step 3: Bank */}
            {stepIndex === 3 && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Bank Name</label>
                  <select className={fieldCls(bankErrors.bankName)} value={state.bankDetail.bankName || ""} onChange={(e) => onBankNameChange(e.target.value)}>
                    <option value="">Select...</option>
                    {bankNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <ErrorText message={bankErrors.bankName} />
                </div>
                <div>
                  <label className={labelCls}>Branch Name</label>
                  <select
                    className={fieldCls(bankErrors.branchName)}
                    value={state.bankDetail.branchCode || ""}
                    onChange={(e) => onBranchNameChange(e.target.value)}
                    disabled={!state.bankDetail.bankName}
                  >
                    <option value="">{state.bankDetail.bankName ? "Select..." : "Select a Bank Name first"}</option>
                    {branchesForSelectedBank.map((b) => (
                      <option key={b.branchCode} value={b.branchCode}>{b.branchName}</option>
                    ))}
                  </select>
                  <ErrorText message={bankErrors.branchName} />
                </div>
                <div>
                  <label className={labelCls}>Branch Code</label>
                  <input className={`${inputCls} bg-gray-50`} value={state.bankDetail.branchCode || ""} readOnly placeholder="Auto-filled from Branch Name" />
                </div>
                <div>
                  <label className={labelCls}>IFSC Code</label>
                  <input className={`${fieldCls(bankErrors.ifscCode)} bg-gray-50`} value={state.bankDetail.ifscCode || ""} readOnly placeholder="Auto-filled from Branch Name" />
                  <ErrorText message={bankErrors.ifscCode} />
                </div>
                <div>
                  <label className={labelCls}>Account Holder Name</label>
                  <input className={inputCls} value={state.bankDetail.accountHolderName || ""} onChange={(e) => setBank({ accountHolderName: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Account Type</label>
                  <select className={inputCls} value={state.bankDetail.accountType || ""} onChange={(e) => setBank({ accountType: e.target.value })}>
                    <option value="">Select...</option>
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Account Number</label>
                  <input className={fieldCls(bankErrors.accountNumber)} value={state.bankDetail.accountNumber || ""} onChange={(e) => setBank({ accountNumber: e.target.value.replace(/\D/g, "") })} />
                  <ErrorText message={bankErrors.accountNumber} />
                </div>
                <p className="sm:col-span-2 text-xs text-gray-400">Leave this whole section blank if not applicable — it's optional unless you start filling it in. Pick a Bank Name then a Branch Name — Branch Code and IFSC Code fill in automatically.</p>
              </div>
            )}

            {/* Step 4: Salary */}
            {stepIndex === 4 && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Pay Scale</label>
                  <input className={inputCls} value={state.salary.payScale || ""} onChange={(e) => setSalary({ payScale: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Basic Pay</label>
                  <input type="number" min={0} className={inputCls} value={state.salary.basicPay ?? ""} onChange={(e) => setSalary({ basicPay: e.target.value === "" ? undefined : Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelCls}>Grade Pay</label>
                  <input type="number" min={0} className={inputCls} value={state.salary.gradePay ?? ""} onChange={(e) => setSalary({ gradePay: e.target.value === "" ? undefined : Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelCls}>Dearness Allowance</label>
                  <input type="number" min={0} className={inputCls} value={state.salary.dearnessAllowance ?? ""} onChange={(e) => setSalary({ dearnessAllowance: e.target.value === "" ? undefined : Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelCls}>House Rent Allowance</label>
                  <input type="number" min={0} className={inputCls} value={state.salary.houseRentAllowance ?? ""} onChange={(e) => setSalary({ houseRentAllowance: e.target.value === "" ? undefined : Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelCls}>Other Allowance</label>
                  <input type="number" min={0} className={inputCls} value={state.salary.otherAllowance ?? ""} onChange={(e) => setSalary({ otherAllowance: e.target.value === "" ? undefined : Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelCls}>Gross Salary</label>
                  <input type="number" min={0} className={inputCls} value={state.salary.grossSalary ?? ""} onChange={(e) => setSalary({ grossSalary: e.target.value === "" ? undefined : Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelCls}>Total Deductions</label>
                  <input type="number" min={0} className={inputCls} value={state.salary.totalDeductions ?? ""} onChange={(e) => setSalary({ totalDeductions: e.target.value === "" ? undefined : Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelCls}>Net Salary</label>
                  <input type="number" min={0} className={inputCls} value={state.salary.netSalary ?? ""} onChange={(e) => setSalary({ netSalary: e.target.value === "" ? undefined : Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelCls}>Effective From</label>
                  <input type="date" className={inputCls} value={state.salary.effectiveFrom?.slice(0, 10) || ""} onChange={(e) => setSalary({ effectiveFrom: e.target.value })} />
                </div>
                <p className="sm:col-span-3 text-xs text-gray-400">This section is optional.</p>
              </div>
            )}

            {/* Step 5: Family */}
            {stepIndex === 5 && (
              <Repeater
                rows={state.family}
                onAdd={() => addRow("family", { relationType: "", name: "", phoneNumber: "", bloodGroup: "", age: undefined, pension: false, pensionPercentage: undefined })}
                onRemove={(i) => removeRow("family", i)}
                addLabel="Add Family Member"
                emptyLabel="No family members added yet."
                renderRow={(row, i) => {
                  const err = familyRowErrors[i] || {};
                  return (
                    <div className="grid sm:grid-cols-4 gap-2 flex-1">
                      <div>
                        <input className={fieldCls(err.relationType)} placeholder="Relation *" value={row.relationType || ""} onChange={(e) => updateRow("family", i, { relationType: e.target.value })} />
                        <ErrorText message={err.relationType} />
                      </div>
                      <div>
                        <input className={fieldCls(err.name)} placeholder="Name *" value={row.name || ""} onChange={(e) => updateRow("family", i, { name: e.target.value })} />
                        <ErrorText message={err.name} />
                      </div>
                      <div>
                        <input className={fieldCls(err.phoneNumber)} placeholder="Phone Number" value={row.phoneNumber || ""} onChange={(e) => updateRow("family", i, { phoneNumber: e.target.value.replace(/\D/g, "") })} />
                        <ErrorText message={err.phoneNumber} />
                      </div>
                      <input type="number" className={inputCls} placeholder="Age" value={row.age ?? ""} onChange={(e) => updateRow("family", i, { age: e.target.value === "" ? undefined : Number(e.target.value) })} />
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={!!row.pension} onChange={(e) => updateRow("family", i, { pension: e.target.checked })} />
                        Pension
                      </label>
                    </div>
                  );
                }}
              />
            )}

            {/* Step 6: Documents (last) — with image/PDF upload */}
            {stepIndex === 6 && (
              <Repeater
                rows={state.documents}
                onAdd={() => addRow("documents", { documentName: "", documentType: "", filePath: "", remarks: "" })}
                onRemove={(i) => removeDocumentRow(i)}
                addLabel="Add Document"
                emptyLabel="No documents added yet."
                renderRow={(row, i) => {
                  const err = documentRowErrors[i] || {};
                  return (
                    <div className="flex-1 space-y-3">
                      <div className="grid sm:grid-cols-3 gap-2">
                        <div>
                          <input className={fieldCls(err.documentName)} placeholder="Document Name *" value={row.documentName || ""} onChange={(e) => updateRow("documents", i, { documentName: e.target.value })} />
                          <ErrorText message={err.documentName} />
                        </div>
                        <input className={inputCls} placeholder="Type (e.g. Aadhar, PAN, Certificate)" value={row.documentType || ""} onChange={(e) => updateRow("documents", i, { documentType: e.target.value })} />
                        <input className={inputCls} placeholder="Remarks" value={row.remarks || ""} onChange={(e) => updateRow("documents", i, { remarks: e.target.value })} />
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <label
                          className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border cursor-pointer ${
                            uploadingRows.has(i)
                              ? "border-gray-200 text-gray-400 cursor-not-allowed"
                              : err.filePath
                              ? "border-red-400 text-red-600 hover:bg-red-50"
                              : "border-[#AC5288] text-[#AC5288] hover:bg-[#AC5288]/5"
                          }`}
                        >
                          <FiUpload size={14} />
                          {uploadingRows.has(i) ? "Uploading..." : row.filePath ? "Replace Image / File" : "Upload Image / File *"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                            className="hidden"
                            disabled={uploadingRows.has(i)}
                            onChange={(e) => handleDocumentFileChange(i, e.target.files?.[0] || null)}
                          />
                        </label>
                        {row.filePath && !uploadingRows.has(i) && (
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">{row.fileName || "File uploaded"}</span>
                        )}
                      </div>
                      <ErrorText message={err.filePath} />

                      {row.filePath && row.contentType?.startsWith("image/") && (
                        <img
                          src={resolveFileUrl(row.filePath)}
                          alt={row.documentName || "Document preview"}
                          className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      {row.filePath && row.contentType === "application/pdf" && (
                        <a
                          href={resolveFileUrl(row.filePath)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-[#AC5288] underline w-fit"
                        >
                          <FiFile size={12} /> View uploaded PDF
                        </a>
                      )}
                    </div>
                  );
                }}
              />
            )}
          </>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
        )}
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 shrink-0 bg-gray-50">
        <button
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-white"
        >
          <FiChevronLeft /> Back
        </button>

        <span className="text-xs text-gray-400 hidden sm:block">
          Step {stepIndex + 1} of {STEPS.length}
        </span>

        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white">
            {employeeId ? "Cancel" : "Clear"}
          </button>
          {stepIndex < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Next <FiChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 brand-gradient text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {saving ? "Saving..." : employeeId ? "Update Employee" : "Save Employee"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Removes any keys present in `patch` from an error map — used so a field's red error
// clears as soon as the person edits that field again.
function clearFields(errors: FieldErrors, patch: Record<string, any>): FieldErrors {
  if (!hasErrors(errors)) return errors;
  const next = { ...errors };
  Object.keys(patch).forEach((k) => delete next[k]);
  return next;
}

function Repeater<T extends Record<string, any>>({
  rows,
  onAdd,
  onRemove,
  renderRow,
  addLabel,
  emptyLabel,
}: {
  rows: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderRow: (row: T, index: number) => React.ReactNode;
  addLabel: string;
  emptyLabel: string;
}) {
  return (
    <div className="space-y-3">
      {rows.length === 0 && <p className="text-sm text-gray-400">{emptyLabel}</p>}
      {rows.map((row, i) => (
        <div key={i} className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
          {renderRow(row, i)}
          <button onClick={() => onRemove(i)} className="p-2 text-gray-400 hover:text-red-600 shrink-0" aria-label="Remove row">
            <FiTrash2 size={16} />
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 text-sm font-medium text-[#AC5288] hover:text-[#3C1053]"
      >
        <FiPlus /> {addLabel}
      </button>
    </div>
  );
}

// Education step — tabular layout: Education | Board/University | Year of Passing | Percentage.
const EDUCATION_OPTIONS = ["SSC", "HSC", "Graduation", "Post Graduation", "Others"];

function EducationTable({
  rows,
  rowErrors,
  onAdd,
  onRemove,
  onChange,
}: {
  rows: Partial<Education>[];
  rowErrors: FieldErrors[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, patch: Partial<Education>) => void;
}) {
  const cellCls = "w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2";
  const cellNormal = `${cellCls} border-gray-300 focus:ring-[#AC5288]`;
  const cellError = `${cellCls} border-red-400 focus:ring-red-400`;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2 font-semibold w-1/4">Education *</th>
              <th className="text-left px-3 py-2 font-semibold w-1/4">Board / University *</th>
              <th className="text-left px-3 py-2 font-semibold w-1/5">Year of Passing *</th>
              <th className="text-left px-3 py-2 font-semibold w-1/5">Percentage *</th>
              <th className="px-2 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-400 text-sm">
                  No education records added yet.
                </td>
              </tr>
            )}
            {rows.map((row, i) => {
              const err = rowErrors[i] || {};
              return (
                <tr key={i} className="align-top">
                  <td className="px-3 py-2">
                    <select
                      className={err.educationName ? cellError : cellNormal}
                      value={row.educationName || ""}
                      onChange={(e) => onChange(i, { educationName: e.target.value })}
                    >
                      <option value="">Select...</option>
                      {EDUCATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ErrorText message={err.educationName} />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={err.boardUniversity ? cellError : cellNormal}
                      placeholder="Board / University"
                      value={row.boardUniversity || ""}
                      onChange={(e) => onChange(i, { boardUniversity: e.target.value })}
                    />
                    <ErrorText message={err.boardUniversity} />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={err.year ? cellError : cellNormal}
                      placeholder="e.g. 2015"
                      maxLength={4}
                      value={row.year || ""}
                      onChange={(e) => onChange(i, { year: e.target.value.replace(/\D/g, "") })}
                    />
                    <ErrorText message={err.year} />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={err.percentage ? cellError : cellNormal}
                      placeholder="e.g. 78.5"
                      value={row.percentage || ""}
                      onChange={(e) => onChange(i, { percentage: e.target.value })}
                    />
                    <ErrorText message={err.percentage} />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button onClick={() => onRemove(i)} className="p-1.5 text-gray-400 hover:text-red-600" aria-label="Remove row">
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={onAdd} className="flex items-center gap-1.5 text-sm font-medium text-[#AC5288] hover:text-[#3C1053]">
        <FiPlus /> Add Education
      </button>
    </div>
  );
}
