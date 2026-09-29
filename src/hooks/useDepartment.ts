"use client";
import { useEffect, useState } from "react";
import { departmentApi } from "@/services/api/departmentApi";
import type { Department } from "@/types/department";

export function useDepartment(departmentId?: string) {
  const [department, setDepartment] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!departmentId) return;
    setIsLoading(true);
    departmentApi
      .byId(departmentId)
      .then((res) => setDepartment(res.data))
      .catch(() => setError("Unable to load department"))
      .finally(() => setIsLoading(false));
  }, [departmentId]);

  return { department, isLoading, error };
}
