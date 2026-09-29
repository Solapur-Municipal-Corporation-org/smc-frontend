"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronDown, FiDatabase, FiRepeat, FiBarChart2, FiArrowLeft, FiList, FiX } from "react-icons/fi";
import { navGroups } from "@/lib/department-navConfig";
import { useLanguage } from "@/lib/department-i18n";
import LanguageToggle from "@/components/department/LanguageToggle";

const groupIcons = {
  masters: FiDatabase,
  lookupMasters: FiList,
  transactions: FiRepeat,
  reports: FiBarChart2,
};

interface SidebarProps {
  deptName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ deptName, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { lang, t } = useLanguage();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ masters: true });
  const toggle = (key: string) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      {/* Backdrop, mobile/tablet only, shown while the drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-[85vw] max-w-72 lg:w-72
          h-screen bg-white border-r border-gray-200
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        <div className="brand-gradient px-4 sm:px-5 py-5 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/department/dashboard"
              onClick={onClose}
              className="flex items-center gap-2 text-white/90 text-sm hover:text-white"
            >
              <FiArrowLeft /> {t("allDepartments")}
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-white/90 hover:text-white p-1 -mr-1"
              aria-label="Close menu"
            >
              <FiX size={20} />
            </button>
          </div>
          <h2 className="text-white font-semibold leading-snug break-words mb-3">{deptName}</h2>
          <LanguageToggle variant="dark" />
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 min-h-0">
          {navGroups.map((group) => {
            const Icon = groupIcons[group.key];
            const isGroupOpen = openGroups[group.key];
            return (
              <div key={group.key} className="mb-1">
                <button
                  onClick={() => toggle(group.key)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-800 font-medium text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="text-[#AC5288]" /> {lang === "mr" ? group.labelMr : group.label}
                  </span>
                  <FiChevronDown className={`transition-transform ${isGroupOpen ? "rotate-180" : ""}`} />
                </button>
                {isGroupOpen && (
                  <div className="ml-6 mt-1 space-y-0.5">
                    {group.links.map((link) => {
                      const href = `/department/${link.href}`;
                      const active = pathname === href;
                      return (
                        <Link
                          key={link.href}
                          href={href}
                          onClick={onClose}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            active
                              ? "bg-[#AC5288]/10 text-[#3C1053] font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {lang === "mr" ? link.labelMr : link.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
