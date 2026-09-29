"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FileSearch,
  Award,
  ChevronDown,
  X,
} from "lucide-react";
import { DepartmentIcon } from "@/lib/department-icons";
import { useCitizenLanguage } from "@/context/CitizenLanguageContext";
import { ServiceLink } from "@/components/citizen/services/service-link";
import { cn } from "@/lib/utils";
import { catalogApi } from "@/lib/citizen-api";
import { Department } from "@/types/citizen-portal";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, translateDepartment } = useCitizenLanguage();
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const selectedDepartment = searchParams.get("department");

  React.useEffect(() => {
    catalogApi.getDepartments()
      .then((response) => {
        const catalog = response.data || [];
        setDepartments(catalog);
        const selected = catalog.find((dept: Department) => dept.code === selectedDepartment);
        setExpanded([selected?.id ?? catalog[0]?.id].filter(Boolean));
      })
      .catch(() => setDepartments([]));
  }, [selectedDepartment]);

  const topLinks = [
    { href: "/citizen/dashboard", label: t("sidebar.dashboard"), icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/citizen/applications", label: t("sidebar.trackApplication"), icon: <FileSearch className="h-4 w-4" /> },
    { href: "/citizen/certificates", label: t("sidebar.myCertificates"), icon: <Award className="h-4 w-4" /> },
  ];

  const toggleDept = (id: string) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));

  const content = (
    <nav className="scrollbar-thin flex h-full flex-col overflow-y-auto px-3 py-4">
      <div className="mb-2 space-y-1">
        {topLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10",
              pathname === link.href && "bg-white/15 text-white shadow-inner"
            )}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      <div className="my-3 h-px bg-white/10" />
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/45">
        {t("sidebar.departmentsServices")}
      </p>

      <div className="space-y-1">
        {departments.filter((dept) => !selectedDepartment || dept.code === selectedDepartment).map((dept) => {
          const isOpen = expanded.includes(dept.id);
          return (
            <div key={dept.id}>
              <button
                onClick={() => toggleDept(dept.id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/85 hover:bg-white/10"
              >
                <span className="flex items-center gap-2.5">
                  <DepartmentIcon name={dept.icon} className="h-4 w-4" />
                  {translateDepartment(dept.code, dept.name)}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
              </button>
              <div
                className={cn(
                  "grid overflow-hidden transition-all duration-300 ease-in-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="min-h-0">
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-4">
                    {dept.services.map((svc) => (
                      <ServiceLink
                        key={svc.id}
                        service={svc}
                        onClick={onClose}
                        className={cn(
                          "block rounded-md px-2.5 py-2 text-[13px] text-white/65 hover:bg-white/10 hover:text-white",
                          pathname === `/citizen/services/${svc.id}` && "bg-accent-500/20 text-accent-500"
                        )}
                      >
                        {svc.name}
                      </ServiceLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 bg-gov-gradient lg:block">{content}</aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-gov-gradient shadow-glossy-lg transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <span className="font-display text-sm font-bold text-white">Menu</span>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        {content}
      </aside>
    </>
  );
}
