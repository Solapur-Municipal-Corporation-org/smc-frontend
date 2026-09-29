"use client";
import * as React from "react";
import Cookies from "js-cookie";
import { translations, departmentNamesMr, type Language } from "@/lib/i18n/citizen-translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  /** Dot-path lookup, e.g. t("header.notifications") */
  t: (key: string) => string;
  /** Translate a department name given its code (falls back to the English name if untranslated) */
  translateDepartment: (code: string, fallbackName: string) => string;
}

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

export function CitizenLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>("en");

  React.useEffect(() => {
    const stored = Cookies.get("cp_lang");
    if (stored === "en" || stored === "mr") setLanguageState(stored);
  }, []);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang);
    Cookies.set("cp_lang", lang, { expires: 365 });
  }, []);

  const toggleLanguage = React.useCallback(() => {
    setLanguage(language === "en" ? "mr" : "en");
  }, [language, setLanguage]);

  const t = React.useCallback(
    (key: string) => {
      const parts = key.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let node: any = translations[language];
      for (const part of parts) {
        node = node?.[part];
      }
      if (typeof node === "string") return node;
      return key;
    },
    [language]
  );

  const translateDepartment = React.useCallback(
    (code: string, fallbackName: string) => {
      if (language === "mr") return departmentNamesMr[code] ?? fallbackName;
      return fallbackName;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, translateDepartment }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useCitizenLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
