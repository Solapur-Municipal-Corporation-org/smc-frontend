"use client";
import Image from "next/image";
import { ShieldCheck, FileCheck2, Clock3 } from "lucide-react";
import { useCitizenLanguage } from "@/context/CitizenLanguageContext";
import { LanguageSwitcher } from "@/components/citizen/layout/language-switcher";

export function AuthShell({
  children,
  formTitle,
  formSubtitle,
}: {
  children: React.ReactNode;
  formTitle: string;
  formSubtitle: string;
}) {
  const { t } = useCitizenLanguage();

  return (
    <div className="min-h-screen w-full bg-background lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Left brand / info panel */}
      <div className="relative hidden overflow-hidden bg-gov-gradient px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-sheen" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-primary-400/10 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-white/25 backdrop-blur">
              <Image src="/logo.png" alt="Portal logo" width={44} height={44} className="h-full w-full object-contain" priority />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight">{t("common.appName")}</p>
              <p className="text-xs text-white/70">{t("common.tagline")}</p>
            </div>
          </div>
          <LanguageSwitcher variant="dark" />
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight">
            {t("auth.heroTitle")}
          </h1>
          <p className="text-white/75">{t("auth.heroSubtitle")}</p>
          <div className="space-y-4 pt-2">
            <Feature icon={<FileCheck2 className="h-4 w-4" />} title={t("auth.featureApplyTitle")} desc={t("auth.featureApplyDesc")} />
            <Feature icon={<Clock3 className="h-4 w-4" />} title={t("auth.featureTrackTitle")} desc={t("auth.featureTrackDesc")} />
            <Feature icon={<ShieldCheck className="h-4 w-4" />} title={t("auth.featureSecureTitle")} desc={t("auth.featureSecureDesc")} />
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} {t("common.appName")} {t("common.tagline")}. {t("auth.footerNote")}
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-glossy ring-1 ring-border">
                <Image src="/logo.png" alt="Portal logo" width={40} height={40} className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="font-display text-base font-bold text-primary-800">{t("common.appName")}</p>
                <p className="text-xs text-muted-foreground">{t("common.tagline")}</p>
              </div>
            </div>
            <div className="ml-auto lg:hidden">
              <LanguageSwitcher />
            </div>
          </div>

          <div className="mb-7">
            <h2 className="font-display text-2xl font-bold text-primary-900">{formTitle}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{formSubtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-white/65">{desc}</p>
      </div>
    </div>
  );
}
