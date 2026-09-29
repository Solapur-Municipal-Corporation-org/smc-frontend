export interface Citizen {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  aadhaarNumber: string;
  mobileNumber: string;
  email: string;
  createdAt: string;
}
