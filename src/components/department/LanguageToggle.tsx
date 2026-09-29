"use client";

import { useLanguage } from "@/lib/department-i18n";

export default function LanguageToggle({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { lang, toggleLang } = useLanguage();

  const isLight = variant === "light";

  return (
    <button
      onClick={toggleLang}
      title={lang === "en" ? "मराठीत पहा" : "View in English"}
      className={`
        relative flex items-center rounded-full text-xs font-semibold select-none
        transition-colors shrink-0
        ${isLight ? "bg-white/15 hover:bg-white/25 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}
      `}
    >
      <span className={`px-2.5 py-1.5 rounded-full transition-colors ${lang === "en" ? (isLight ? "bg-white text-[#3C1053]" : "bg-white text-[#3C1053] shadow-sm") : ""}`}>
        EN
      </span>
      <span className={`font-marathi px-2.5 py-1.5 rounded-full transition-colors ${lang === "mr" ? (isLight ? "bg-white text-[#3C1053]" : "bg-white text-[#3C1053] shadow-sm") : ""}`}>
        मर
      </span>
    </button>
  );
}
