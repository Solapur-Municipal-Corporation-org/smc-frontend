"use client";
import * as React from "react";
import { Award, Download, Lock, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { applicationsApi } from "@/lib/citizen-api";
import { formatDate, currentFinancialYear } from "@/lib/utils";
import { Application } from "@/types/citizen-portal";
import { useCitizenLanguage } from "@/context/CitizenLanguageContext";

export default function CertificatesPage() {
  const fy = currentFinancialYear();
  const { t } = useCitizenLanguage();
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    applicationsApi
      .getMine()
      .then((response) => setApplications(response.data))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const approved = applications.filter((a) => a.status === "Approved");

  function handleDownload(appNumber: string, serviceName: string) {
    // In production: applicationsApi.downloadCertificate(applicationId) -> streamed PDF blob
    const content = `NAGRI SEVA CITIZEN PORTAL\nCertificate: ${serviceName}\nApplication No: ${appNumber}\nFinancial Year: ${fy}\nIssued: ${formatDate(new Date())}\n\nThis is a demo-generated certificate placeholder.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appNumber.replace(/\//g, "_")}_certificate.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900">{t("certificates.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("certificates.subtitle")} {fy} {t("certificates.subtitleSuffix")}
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">Loading certificates...</CardContent>
        </Card>
      ) : approved.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <Award className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-foreground">{t("certificates.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("certificates.emptyDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {approved.map((app) => {
            const validThisYear = app.financialYear === fy;
            return (
              <Card key={app.id} className="overflow-hidden">
                <div className="flex items-center gap-3 border-b border-border bg-primary-50/50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{app.serviceName}</p>
                    <p className="text-xs text-muted-foreground">{app.departmentName}</p>
                  </div>
                </div>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("certificates.applicationNo")}</span>
                    <span className="font-medium text-foreground">{app.applicationNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("certificates.approvedOn")}</span>
                    <span className="font-medium text-foreground">{formatDate(app.updatedOn)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("certificates.financialYear")}</span>
                    <Badge variant={validThisYear ? "success" : "outline"}>{app.financialYear}</Badge>
                  </div>

                  {validThisYear ? (
                    <Button className="mt-1 w-full" onClick={() => handleDownload(app.applicationNumber, app.serviceName)}>
                      <Download className="h-4 w-4" /> {t("certificates.download")}
                    </Button>
                  ) : (
                    <div className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" /> {t("certificates.expired")} {app.financialYear}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t("certificates.footerNote")} ({fy}).</p>
        </CardContent>
      </Card>
    </div>
  );
}
