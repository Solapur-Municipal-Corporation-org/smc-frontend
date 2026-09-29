"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { lang, toggleLang } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-md bg-brand-gradient" aria-hidden />
          <span className="font-semibold text-brand-dark">
            {lang === "en" ? "SMC Master Portal" : "एसएमसी मास्टर पोर्टल"}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLang}
            className="text-sm text-gray-600 hover:text-brand-dark"
          >
            {lang === "en" ? "मराठी" : "English"}
          </button>
          {user && (
            <button onClick={logout} className="text-sm text-gray-600 hover:text-brand-dark">
              {lang === "en" ? "Sign out" : "बाहेर पडा"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
