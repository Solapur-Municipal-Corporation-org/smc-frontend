"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/citizen/layout/header";
import { Sidebar } from "@/components/citizen/layout/sidebar";
import { useCitizenAuth } from "@/context/CitizenAuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { citizen, loading } = useCitizenAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const isPublicRoute = pathname === "/citizen/login" || pathname === "/citizen/register";

  React.useEffect(() => {
    if (!isPublicRoute && !loading && !citizen) router.replace("/citizen/login");
  }, [isPublicRoute, loading, citizen, router]);

  if (isPublicRoute) return <>{children}</>;

  if (loading || !citizen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
