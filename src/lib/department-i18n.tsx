"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "mr";

/**
 * Shared "chrome" strings — login page, headers, sidebar shell, common
 * buttons — translated once here so every page can pull from the same
 * dictionary via the `t()` helper below.
 */
const dict = {
  en: {
    portalName: "Department Portal",
    portalTagline: "Employee Workspace",
    corpBadge: "Municipal Corporation · Employee Access",
    heroTitle: "One portal for every department, service and record.",
    heroSubtitle:
      "Sign in with your registered mobile number and password to access your department's dashboard, masters and records.",
    secureSignIn: "Secure sign-in",
    departmentsOnline: "departments online",
    footerNote: "For authorized employee use only.",
    welcomeBack: "Welcome back",
    welcomeSubtitle: "Enter your registered mobile number and password to sign in.",
    mobileNumber: "Mobile Number",
    password: "Password",
    mobilePlaceholder: "9876543210",
    passwordPlaceholder: "Enter your password",
    signIn: "Sign In",
    signingIn: "Signing in...",
    troubleSignIn: "Trouble signing in? Contact your IT Department administrator.",
    allDepartments: "All Departments",
    departments: "Departments",
    departmentsCountSuffix: "departments · tap a card to open its dashboard",
    searchPlaceholder: "Search departments...",
    noResults: "No departments match your search.",
    logout: "Logout",
    masters: "Masters",
    lookupMasters: "Lookup Masters",
    transactions: "Transactions",
    reports: "Reports",
    loading: "Loading...",
  },
  mr: {
    portalName: "विभाग पोर्टल",
    portalTagline: "कर्मचारी कार्यक्षेत्र",
    corpBadge: "महानगरपालिका · कर्मचारी प्रवेश",
    heroTitle: "प्रत्येक विभाग, सेवा आणि नोंदीसाठी एकच पोर्टल.",
    heroSubtitle:
      "आपल्या विभागाचे डॅशबोर्ड, मास्टर्स आणि नोंदी पाहण्यासाठी नोंदणीकृत मोबाईल क्रमांक आणि पासवर्डने साइन इन करा.",
    secureSignIn: "सुरक्षित साइन-इन",
    departmentsOnline: "विभाग कार्यरत",
    footerNote: "केवळ अधिकृत कर्मचारी वापरासाठी.",
    welcomeBack: "पुन्हा स्वागत आहे",
    welcomeSubtitle: "साइन इन करण्यासाठी नोंदणीकृत मोबाईल क्रमांक आणि पासवर्ड टाका.",
    mobileNumber: "मोबाईल क्रमांक",
    password: "पासवर्ड",
    mobilePlaceholder: "९८७६५४३२१०",
    passwordPlaceholder: "आपला पासवर्ड टाका",
    signIn: "साइन इन करा",
    signingIn: "साइन इन करत आहे...",
    troubleSignIn: "साइन इन करताना अडचण येत आहे? आपल्या आयटी विभाग प्रशासकाशी संपर्क साधा.",
    allDepartments: "सर्व विभाग",
    departments: "विभाग",
    departmentsCountSuffix: "विभाग · डॅशबोर्ड उघडण्यासाठी कार्डवर टॅप करा",
    searchPlaceholder: "विभाग शोधा...",
    noResults: "आपल्या शोधाशी जुळणारा कोणताही विभाग नाही.",
    logout: "लॉगआउट",
    masters: "मास्टर्स",
    lookupMasters: "लूकअप मास्टर्स",
    transactions: "व्यवहार",
    reports: "अहवाल",
    loading: "लोड होत आहे...",
  },
} as const;

export type DictKey = keyof typeof dict.en;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: DictKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "smc_portal_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore saved preference after mount (avoids SSR/client mismatch).
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "mr") setLangState(saved);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const toggleLang = () => setLang(lang === "en" ? "mr" : "en");

  const t = (key: DictKey) => dict[lang][key] ?? dict.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
