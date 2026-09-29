export interface Citizen {
  id: string;
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  aadhaarNumber?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  nearestLocation?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  icon: string;
  services: Service[];
}

export interface Service {
  id: string;
  departmentId: string;
  name: string;
  description: string;
  fee: number;
  processingDays: number;
  documentsRequired: string[];
  fields: ServiceField[];
  /** If set, this service opens an external link (in a new tab) instead of the internal application form. */
  externalUrl?: string;
}

export interface ServiceField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "email" | "tel";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export type ApplicationStatus = "Pending" | "UnderReview" | "Approved" | "Rejected";

export interface Application {
  id: string;
  applicationNumber: string;
  serviceId: string;
  serviceName: string;
  departmentName: string;
  status: ApplicationStatus;
  submittedOn: string;
  updatedOn: string;
  financialYear: string;
  fee: number;
  paymentStatus: "Unpaid" | "Paid";
  remarks?: string;
}

export interface PaymentReceipt {
  receiptNumber: string;
  applicationNumber: string;
  amount: number;
  paidOn: string;
  paymentMode: string;
  transactionId: string;
}
