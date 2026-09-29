export interface Department {
  departmentId: number;
  organizationId: number;
  srNo: number;
  departmentName: string;
  departmentNameMarathi: string;
  departmentCode: string;
  primaryFunctions: string;
  departmentHead?: string;
  email?: string;
  mobileNumber?: string;
  isActive: boolean;
  serviceCount: number;
}

export interface Organization {
  organizationId: number;
  organizationName: string;
  organizationNameMarathi: string;
  printingHeader?: string;
  organizationType?: string;
  email?: string;
  phoneNumber1?: string;
  phoneNumber2?: string;
  website?: string;
  gstNumber?: string;
  panNumber?: string;
  registrationNumber?: string;
  activeCommissioner?: string;
  activeMayor?: string;
  activeDyMayor?: string;
  activeStandingChairman?: string;
  location?: string;
  isActive: boolean;
}

export interface Service {
  serviceId: number;
  departmentId: number;
  serviceName: string;
  serviceNameMarathi?: string;
  serviceCode: string;
  description?: string;
  isActive: boolean;
}

export interface UserAccount {
  userId: number;
  departmentId?: number;
  fullName: string;
  mobileNumber: string;
  email?: string;
  role: "SystemAdmin" | "DepartmentAdmin" | "DepartmentEmployee";
  isActive: boolean;
  password?: string; // write-only: set on create, optional on update
}

export interface Country {
  countryId: number;
  countryName: string;
  mobileCode?: string;
}

export interface State {
  stateId: number;
  stateName: string;
  countryId: number;
  remarks?: string;
}

export interface District {
  districtId: number;
  districtName: string;
  stateId: number;
  remarks?: string;
}

export interface Tahsil {
  tahsilId: number;
  tahsilName: string;
  districtId: number;
  remarks?: string;
}

export interface City {
  cityId: number;
  cityName: string;
  tahsilId: number;
  remarks?: string;
}

export interface Location {
  locationId: number;
  locationName: string;
  remarks?: string;
}

export interface Address {
  addressId: number;
  organizationId: number;
  addressLine1: string;
  addressLine2?: string;
  location?: string;
  cityName?: string;
  cityCode?: string;
  tahsil?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface FinancialYear {
  financialYearId: number;
  financialYearName: string;
  remarks?: string;
}

export interface Holiday {
  holidayId: number;
  financialYearId: number;
  date: string;
  festivalName: string;
  createdBy?: string;
  remarks?: string;
}

export interface Employee {
  employeeId: number;
  employeeCode: string;
  departmentId?: number;
  firstNameEnglish: string;
  firstNameMarathi?: string;
  fatherNameEnglish?: string;
  fatherNameMarathi?: string;
  motherNameEnglish?: string;
  motherNameMarathi?: string;
  lastNameEnglish: string;
  lastNameMarathi?: string;
  mobileNumber?: string;
  mailId?: string;
  phoneNumber?: string;
  gender?: string;
  bloodGroup?: string;
  dob?: string;
  aadharNo?: string;
  panNo?: string;
  maritalStatus?: string;
  occupation?: string;
  physicallyHandicapped: boolean;
  isActive: boolean;
}

export interface Education {
  educationId: number;
  employeeId: number;
  educationName: string;
  boardUniversity?: string;
  year?: string;
  marks?: string;
  percentage?: string;
  state?: string;
  remarks?: string;
}

export interface Family {
  familyId: number;
  employeeId: number;
  relationType: string;
  name: string;
  phoneNumber?: string;
  bloodGroup?: string;
  age?: number;
  pension: boolean;
  pensionPercentage?: number;
}

export interface EmployeeLeaveBalance {
  leaveBalanceId: number;
  employeeId: number;
  financialYearId?: number;
  earnedLeave: number;
  halfPayLeave: number;
  commutedLeave: number;
  leaveNotDue: number;
  maternityLeave: number;
  paternityLeave: number;
  childCareLeave: number;
  studyLeave: number;
  casualLeave: number;
  extraordinaryLeave: number;
  specialDisabilityLeave: number;
  hospitalLeave: number;
  quarantineLeave: number;
}

/** Document sheet row — step 7 (last) of the combined Employee form.
 *  filePath/fileName/contentType are filled in by POST /uploads/employee-document. */
export interface EmployeeDocument {
  documentId: number;
  employeeId: number;
  documentName: string;
  documentType?: string;
  filePath?: string;
  fileName?: string;
  contentType?: string;
  fileSizeBytes?: number;
  remarks?: string;
}

/** Employee's Permanent + Current address — step 2 of the combined Employee form. */
export interface EmployeeAddress {
  employeeAddressId: number;
  employeeId: number;

  // Permanent Address
  permanentAddressLine1: string;
  permanentAddressLine2?: string;
  permanentCity?: string;
  permanentTahsil?: string;
  permanentDistrict?: string;
  permanentState?: string;
  permanentCountry?: string;
  permanentPincode?: string;

  // Current Address
  sameAsPermanent?: boolean;
  currentAddressLine1?: string;
  currentAddressLine2?: string;
  currentCity?: string;
  currentTahsil?: string;
  currentDistrict?: string;
  currentState?: string;
  currentCountry?: string;
  currentPincode?: string;
}

/** Employee's salary bank account — step 5 of the combined Employee form. */
export interface EmployeeBankDetail {
  employeeBankDetailId: number;
  employeeId: number;
  bankName: string;
  branchCode?: string;
  branchName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: string;
}

/** Employee's current pay structure — step 6 of the combined Employee form. */
export interface EmployeeSalary {
  employeeSalaryId: number;
  employeeId: number;
  payScale?: string;
  basicPay?: number;
  gradePay?: number;
  dearnessAllowance?: number;
  houseRentAllowance?: number;
  otherAllowance?: number;
  grossSalary?: number;
  totalDeductions?: number;
  netSalary?: number;
  effectiveFrom?: string;
}

/** Full composite record read/written by the combined 7-step Employee wizard. */
export interface EmployeeProfile {
  employee: Partial<Employee>;
  address: Partial<EmployeeAddress> | null;
  bankDetail: Partial<EmployeeBankDetail> | null;
  salary: Partial<EmployeeSalary> | null;
  education: Partial<Education>[];
  family: Partial<Family>[];
  documents: Partial<EmployeeDocument>[];
}

export interface LoginRequest {
  mobileNumber: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  fullName: string;
  role: "Admin" | "DepartmentUser";
  departmentId: number | null;
  expiresAt: string;
}
