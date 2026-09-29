"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import departmentApi from "@/lib/department-api";
import { DepartmentAuthProvider, useDepartmentAuth } from "@/context/DepartmentAuthContext";
import Sidebar from "@/components/department/Sidebar";
import TopBar from "@/components/department/TopBar";
import { useLanguage, LanguageProvider } from "@/lib/department-i18n";

// NOTE: this replaces the previous stub layout (ProtectedRoute/RoleGuard/Header, built against
// the unfinished SMC.Master.API scaffold's own auth). The login page itself (/department/login)
// is the route guard here: it's the only place that redirects to it. See INTEGRATION_REPORT.md.

function DeptDashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useDepartmentAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { lang, t } = useLanguage();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/department/login");
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) return null; // avoid a flash of the login redirect while cookies are read

  const deptDisplayName = user?.departmentId
    ? `Department ${user.departmentId}`
    : "All Departments"; // SystemAdmin

  return (
    <div className="lg:flex">
      <Sidebar deptName={deptDisplayName} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <TopBar title={deptDisplayName} subtitle="SMC Department Portal" user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 bg-gray-50">
          <div className="max-w-6xl mx-auto p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function DepartmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <DepartmentAuthProvider>
        <DeptDashboardShell>{children}</DeptDashboardShell>
      </DepartmentAuthProvider>
    </LanguageProvider>
  );
}
