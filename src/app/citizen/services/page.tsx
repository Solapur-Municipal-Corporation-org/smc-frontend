"use client";
import * as React from "react";
import { Search, ArrowRight, ExternalLink, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { catalogApi } from "@/lib/citizen-api";
import { useCitizenLanguage } from "@/context/CitizenLanguageContext";
import { ServiceLink } from "@/components/citizen/services/service-link";
import { Department } from "@/types/citizen-portal";

export default function ServicesCatalogPage() {
  const [query, setQuery] = React.useState("");
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t, translateDepartment } = useCitizenLanguage();

  React.useEffect(() => {
    let cancelled = false;
    catalogApi.getDepartments()
      .then((response) => { if (!cancelled) setDepartments(response.data ?? []); })
      .catch(() => { if (!cancelled) setDepartments([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = departments
    .map((dept) => ({
      ...dept,
      services: dept.services.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((dept) => dept.services.length > 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900">{t("services.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("services.subtitle")}</p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t("services.searchPlaceholder")} className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading services...</p>}

      {filtered.map((dept) => (
        <div key={dept.id}>
          <h2 className="mb-3 font-display text-base font-semibold text-primary-800">{translateDepartment(dept.code, dept.name)}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dept.services.map((svc) => (
              <ServiceLink key={svc.id} service={svc}>
                <Card className="h-full transition-shadow hover:shadow-glossy-lg">
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="font-display text-sm font-semibold text-foreground">{svc.name}</p>
                    <p className="mt-1 flex-1 text-xs text-muted-foreground">{svc.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant={svc.fee > 0 ? "accent" : "outline"}>
                        {svc.fee > 0 ? `₹${svc.fee} ${t("services.feeSuffix")}` : t("services.noFee")}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary-600">
                        {t("services.apply")}{" "}
                        {svc.externalUrl ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </ServiceLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
