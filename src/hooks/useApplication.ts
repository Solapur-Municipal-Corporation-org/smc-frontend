"use client";
import { useEffect, useState } from "react";
import { applicationApi } from "@/services/api/applicationApi";
import type { Application } from "@/types/application";

export function useApplication(applicationId?: string) {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) return;
    setIsLoading(true);
    applicationApi
      .byId(applicationId)
      .then((res) => setApplication(res.data))
      .finally(() => setIsLoading(false));
  }, [applicationId]);

  return { application, isLoading };
}
