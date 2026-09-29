import api from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import type { Transaction } from "@/types/transaction";

export const transactionApi = {
  list: () => api.get<Transaction[]>(API_ENDPOINTS.TRANSACTION.LIST),
  byApplication: (applicationId: string) =>
    api.get<Transaction[]>(API_ENDPOINTS.TRANSACTION.BY_APPLICATION(applicationId)),
};
