"use client";

import "@/features/bhoomi-malmatta/index.css";
import DepartmentBhoomiAuthBridge from "@/features/bhoomi-malmatta/context/DepartmentBhoomiAuthBridge";

export default function BhoomiDepartmentLayout({ children }) {
  return <DepartmentBhoomiAuthBridge>{children}</DepartmentBhoomiAuthBridge>;
}
