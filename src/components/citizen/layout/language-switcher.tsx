"use client";
import { Languages } from "lucide-react";
import { useCitizenLanguage } from "@/context/CitizenLanguageContext";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { language, setLanguage } = useCitizenLanguage();

  const base = "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold";
  const theme =
    variant === "dark"
      ? "border-white/25 bg-white/10 text-white backdrop-blur"
      : "border-border bg-white text-foreground shadow-sm";

  return (
    <div className={cn(base, theme)}>
      <Languages className="h-3.5 w-3.5 opacity-70" />
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded-full px-2 py-0.5 transition-colors",
          language === "en"
            ? variant === "dark"
              ? "bg-white text-primary-800"
              : "bg-primary-600 text-white"
            : "opacity-60 hover:opacity-100"
        )}
      >
        English
      </button>
      <span className="opacity-40">|</span>
      <button
        type="button"
        onClick={() => setLanguage("mr")}
        className={cn(
          "rounded-full px-2 py-0.5 transition-colors",
          language === "mr"
            ? variant === "dark"
              ? "bg-white text-primary-800"
              : "bg-primary-600 text-white"
            : "opacity-60 hover:opacity-100"
        )}
      >
        मराठी
      </button>
    </div>
  );
}
