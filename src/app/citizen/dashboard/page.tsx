"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCitizenAuth } from "@/context/CitizenAuthContext";
import { useCitizenLanguage } from "@/context/CitizenLanguageContext";
import { formatDate } from "@/lib/utils";
import { statusBadgeVariant, statusLabel } from "@/components/citizen/services/status-utils";
import { applicationsApi } from "@/lib/citizen-api";
import { ApplicationStatus } from "@/types/citizen-portal";

interface ApplicationResponse {
  id: string;
  applicationNumber: string;
  serviceName: string;
  departmentName: string;
  status: ApplicationStatus;
  submittedOn: string;
  fee: number;
  paymentStatus: string;
  formDataJson: string;
  remarks?: string;
}

function parseFormData(value: string): Record<string, string> {
  try {
    return value ? JSON.parse(value) as Record<string, string> : {};
  } catch {
    return {};
  }
}

export default function DashboardHome() {
  const { citizen } = useCitizenAuth();
  const { t, language } = useCitizenLanguage();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await applicationsApi.getMine();
        setApplications(response.data || []);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError("Failed to load applications");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    if (citizen) {
      fetchApplications();
    }
  }, [citizen]);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "Pending" || a.status === "UnderReview").length,
    approved: applications.filter((a) => a.status === "Approved").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gov-gradient px-6 py-8 text-white shadow-glossy-lg sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-sheen" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-sm text-white/70">{t("dashboard.welcomeBack")}</p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{citizen?.fullName}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/75">{t("dashboard.welcomeSubtitle")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<FileText className="h-5 w-5" />} label={t("dashboard.totalApplications")} value={stats.total} tone="primary" loading={loading} />
        <StatCard icon={<Clock className="h-5 w-5" />} label={t("dashboard.inProgress")} value={stats.pending} tone="warning" loading={loading} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label={t("dashboard.approved")} value={stats.approved} tone="success" loading={loading} />
        <StatCard icon={<XCircle className="h-5 w-5" />} label={t("dashboard.rejected")} value={stats.rejected} tone="destructive" loading={loading} />
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Recent applications */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-primary-900">{t("dashboard.recentApplications")}</h2>
          <Link href="/citizen/certificates" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
            {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Card>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">You have no applications yet</p>
                <Button asChild variant="default">
                  <Link href="/citizen/services">Browse Services</Link>
                </Button>
              </div>
            ) : (
              applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{app.serviceName}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.applicationNumber} &middot; {app.departmentName} &middot; {formatDate(app.submittedOn)}
                    </p>
                    {app.formDataJson && (
                      <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                        {Object.entries(parseFormData(app.formDataJson)).map(([key, value]) => (
                          <span key={key}><strong>{key}:</strong> {value}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusBadgeVariant(app.status)}>{statusLabel(app.status, language)}</Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/citizen/applications?applicationNumber=${app.applicationNumber}`}>{t("common.view")}</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "primary" | "warning" | "success" | "destructive";
  loading?: boolean;
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary-50 text-primary-700",
    warning: "bg-amber-50 text-amber-700",
    success: "bg-green-50 text-green-700",
    destructive: "bg-red-50 text-red-700",
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneMap[tone]}`}>{icon}</div>
        <div>
          <p className="font-display text-2xl font-bold text-foreground">
            {loading ? "—" : value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
