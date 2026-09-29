"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiMenu, FiBell, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import { AuthUser, clearSession } from "@/lib/department-auth";
import { useLanguage } from "@/lib/department-i18n";
import LanguageToggle from "@/components/department/LanguageToggle";

type OpenMenu = "notifications" | "settings" | "profile" | null;

interface TopBarProps {
  /** Portal / department name shown next to the logo. */
  title: string;
  subtitle?: string;
  user: AuthUser | null;
  /** Pass this to show the mobile hamburger button that opens the sidebar drawer. */
  onMenuClick?: () => void;
}

export default function TopBar({ title, subtitle, user, onMenuClick }: TopBarProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close whichever dropdown is open when clicking outside the top bar.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const toggle = (menu: OpenMenu) => setOpenMenu((prev) => (prev === menu ? null : menu));

  return (
    <header className="sticky top-0 z-20 brand-gradient text-white shadow-md">
      <div ref={containerRef} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-white/15 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <FiMenu size={22} />
          </button>
        )}

        <img
          src="/smc-logo.png"
          alt="SMC"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/15 p-0.5 shrink-0"
        />
        <div className="min-w-0">
          <h1 className="font-semibold text-sm sm:text-base leading-tight truncate">{title}</h1>
          {subtitle && <p className="font-marathi text-[11px] sm:text-xs text-white/80 truncate leading-tight">{subtitle}</p>}
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
          <LanguageToggle variant="dark" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => toggle("notifications")}
              className="relative p-2 rounded-lg hover:bg-white/15 transition-colors"
              aria-label="Notifications"
            >
              <FiBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
            </button>
            {openMenu === "notifications" && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-700 rounded-xl shadow-xl border border-gray-100 p-4 text-sm z-30">
                <p className="font-semibold text-gray-900 mb-1">Notifications</p>
                <p className="text-gray-400 text-xs">You're all caught up — no new notifications.</p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => toggle("settings")}
              className="p-2 rounded-lg hover:bg-white/15 transition-colors"
              aria-label="Settings"
            >
              <FiSettings size={18} />
            </button>
            {openMenu === "settings" && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-gray-700 rounded-xl shadow-xl border border-gray-100 p-4 text-sm z-30">
                <p className="font-semibold text-gray-900 mb-1">Settings</p>
                <p className="text-gray-400 text-xs">Account &amp; portal settings — coming soon.</p>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => toggle("profile")}
              className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2 py-1 rounded-lg hover:bg-white/15 transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold shrink-0">
                {initials}
              </span>
              <span className="hidden md:flex flex-col items-start leading-tight max-w-[9rem]">
                <span className="text-sm font-medium truncate w-full text-left">{user?.fullName || "..."}</span>
                <span className="text-[11px] text-white/70 truncate w-full text-left">{user?.role}</span>
              </span>
              <FiChevronDown size={14} className="hidden md:block opacity-70" />
            </button>
            {openMenu === "profile" && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-gray-700 rounded-xl shadow-xl border border-gray-100 p-4 text-sm z-30">
                <p className="font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-gray-400 text-xs">{user?.role}</p>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs sm:text-sm bg-white/15 hover:bg-white/25 px-2 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            <FiLogOut size={15} /> <span className="hidden sm:inline">{t("logout")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
