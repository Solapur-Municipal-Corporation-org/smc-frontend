"use client";
import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, CheckCircle2, Clock, FileSearch, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { applicationsApi } from "@/lib/citizen-api";
import { Application } from "@/types/citizen-portal";
import { formatDate, cn } from "@/lib/utils";
import { statusBadgeVariant, statusLabel, statusStep } from "@/components/citizen/services/status-utils";
import { useCitizenLanguage } from "@/context/CitizenLanguageContext";

function StatusSearch() {
  const searchParams = useSearchParams();
  const { t, language } = useCitizenLanguage();
  const [query, setQuery] = React.useState(searchParams.get("applicationNumber") || "");
  const [result, setResult] = React.useState<(Application & { formDataJson?: string }) | null | undefined>(undefined);
  const [searching, setSearching] = React.useState(false);

  const steps = [
    { key: 1, label: t("status.submitted"), icon: FileSearch },
    { key: 2, label: t("status.underReview"), icon: Clock },
    { key: 3, label: t("status.decision"), icon: CheckCircle2 },
  ];

  const runSearch = React.useCallback(async (value: string) => {
    if (!value.trim()) return;
    setSearching(true);
    try {
      const response = await applicationsApi.getByNumber(value.trim());
      setResult(response.data);
    } catch {
      setResult(null);
    }
    setSearching(false);
  }, []);

  React.useEffect(() => {
    if (searchParams.get("applicationNumber")) runSearch(searchParams.get("applicationNumber")!);
  }, [searchParams, runSearch]);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-primary-900">{t("status.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("status.subtitle")}</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("status.placeholder")}
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
          />
        </div>
        <Button onClick={() => runSearch(query)} disabled={searching}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : t("status.track")}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Enter the application number received after submission.
      </p>

      {result === null && (
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-foreground">{t("status.notFoundTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("status.notFoundDesc")}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="overflow-hidden">
          <div className="border-b border-border bg-muted/40 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg font-semibold text-foreground">{result.serviceName}</p>
                <p className="text-sm text-muted-foreground">{result.departmentName} · {result.applicationNumber}</p>
              </div>
              <Badge variant={statusBadgeVariant(result.status)}>{statusLabel(result.status, language)}</Badge>
            </div>
          </div>

          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => {
                const currentStep = statusStep(result.status);
                const isRejected = result.status === "Rejected" && step.key === 3;
                const active = currentStep >= step.key;
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                          active
                            ? isRejected
                              ? "border-destructive bg-destructive/10 text-destructive"
                              : "border-primary-600 bg-primary-600 text-white"
                            : "border-border bg-white text-muted-foreground"
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className={cn("text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                        {isRejected ? statusLabel("Rejected", language) : step.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={cn("mx-2 h-0.5 flex-1", currentStep > step.key ? "bg-primary-600" : "bg-border")} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-4 text-sm sm:grid-cols-4">
              <Detail label={t("status.submitted")} value={formatDate(result.submittedOn)} />
              <Detail label={t("status.lastUpdated")} value={formatDate(result.updatedOn)} />
              <Detail label={t("status.fee")} value={result.fee > 0 ? `₹${result.fee}` : "N/A"} />
              <Detail label={t("status.payment")} value={result.paymentStatus} />
            </div>

            {result.status === "Rejected" && result.remarks && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <p className="font-semibold">{t("status.rejectionReason")}</p>
                <p className="mt-0.5">{result.remarks}</p>
              </div>
            )}

            {result.formDataJson && (
              <div className="grid grid-cols-1 gap-3 rounded-lg bg-muted/40 p-4 text-sm sm:grid-cols-2">
                {Object.entries(JSON.parse(result.formDataJson) as Record<string, string>).map(([key, value]) => (
                  <Detail key={key} label={key} value={value} />
                ))}
              </div>
            )}

            {result.status === "Approved" && (
              <Button className="w-full" asChild>
                <a href="/citizen/certificates">{t("status.goToCertificate")}</a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={null}>
      <StatusSearch />
    </Suspense>
  );
}
