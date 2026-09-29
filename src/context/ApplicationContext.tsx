"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import type { Application } from "@/types/application";

interface ApplicationContextType {
  activeApplication: Application | null;
  setActiveApplication: (app: Application | null) => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  return (
    <ApplicationContext.Provider value={{ activeApplication, setActiveApplication }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplicationContext() {
  const ctx = useContext(ApplicationContext);
  if (!ctx) throw new Error("useApplicationContext must be used within ApplicationProvider");
  return ctx;
}
