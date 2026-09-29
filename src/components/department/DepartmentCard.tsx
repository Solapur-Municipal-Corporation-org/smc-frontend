"use client";

import { useRouter } from "next/navigation";
import { Department } from "@/types/department-portal";
import { getDeptEmoji, getDeptTheme } from "@/lib/deptIcons";
import { useLanguage } from "@/lib/department-i18n";

export default function DepartmentCard({ dept }: { dept: Department }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const emoji = getDeptEmoji(dept.departmentName, dept.primaryFunctions, dept.departmentCode);
  const theme = getDeptTheme(dept.departmentCode || dept.departmentName);

  // Only the name in the currently selected language is shown on the card.
  const name = lang === "mr" ? dept.departmentNameMarathi || dept.departmentName : dept.departmentName;

  return (
    <button
      onClick={() => router.push(`/dashboard/${dept.departmentId}`)}
      className="group flex flex-col items-center justify-start text-center gap-2 sm:gap-3 rounded-2xl border p-3 sm:p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
      style={{ backgroundColor: theme.bg, borderColor: theme.ring }}
      title={dept.departmentName}
    >
      {/* Icon badge: soft white disc behind a large colour emoji, like the reference app icons */}
      <span
        className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-105"
        style={{ backgroundColor: "rgba(255,255,255,0.75)" }}
      >
        <span className="text-3xl sm:text-4xl leading-none">{emoji}</span>
      </span>

      <p
        className={`w-full text-xs sm:text-sm font-bold text-gray-800 leading-tight line-clamp-2 ${
          lang === "mr" ? "font-marathi" : ""
        }`}
      >
        {name}
      </p>
    </button>
  );
}
