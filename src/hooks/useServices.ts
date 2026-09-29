"use client";
import { useEffect, useState } from "react";
import { serviceApi } from "@/services/api/serviceApi";
import type { Service } from "@/types/service";

export function useServices(departmentId?: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const request = departmentId
      ? serviceApi.byDepartment(departmentId)
      : serviceApi.list();
    request
      .then((res) => setServices(res.data))
      .finally(() => setIsLoading(false));
  }, [departmentId]);

  return { services, isLoading };
}
