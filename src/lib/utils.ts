import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function currentFinancialYear() {
  const now = new Date();
  const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${y}-${(y + 1).toString().slice(-2)}`;
}

export function generateApplicationNumber(deptCode: string) {
  const fy = currentFinancialYear().replace("-", "");
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `CP/${deptCode}/${fy}/${rand}`;
}
