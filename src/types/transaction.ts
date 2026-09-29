export interface Transaction {
  id: string;
  applicationId: string;
  amount: number;
  mode: "Online" | "Cash" | "DD" | "Cheque";
  status: "Pending" | "Success" | "Failed";
  transactionDate: string;
  referenceNumber: string;
}
