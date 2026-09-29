"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, LogOut, Menu, Search, Settings, User, ChevronDown } from "lucide-react";
import { useCitizenAuth } from "@/context/CitizenAuthContext";
import { useCitizenLanguage } from "@/context/CitizenLanguageContext";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/citizen/layout/language-switcher";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { citizen, logout } = useCitizenAuth();
  const { t } = useCitizenLanguage();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/85 px-4 shadow-sm backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-primary-700 hover:bg-muted lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/citizen/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white shadow-glossy ring-1 ring-border">
            <Image src="/logo.png" alt="Portal logo" width={36} height={36} className="h-full w-full object-contain" priority />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold leading-tight text-primary-900">{t("common.appName")}</p>
            <p className="text-[11px] leading-tight text-muted-foreground">{t("common.tagline")}</p>
          </div>
        </Link>
      </div>

      <div className="hidden max-w-md flex-1 items-center px-6 md:flex">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder={t("header.searchPlaceholder")}
            className="h-10 w-full rounded-lg border border-input bg-muted/60 pl-9 pr-3 text-sm outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        <div className="relative">
          <button
            onClick={() => { setNotifOpen((s) => !s); setProfileOpen(false); }}
            className="relative rounded-lg p-2 text-primary-700 hover:bg-muted"
            aria-label={t("header.notifications")}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 animate-fade-in rounded-xl border border-border bg-white p-2 shadow-glossy-lg">
              <p className="px-2 py-1.5 text-sm font-semibold text-foreground">{t("header.notifications")}</p>
              <NotifItem title="Application Approved" desc="Your Income Certificate (CP/GAD/202526/482913) has been approved." time="2 days ago" />
              <NotifItem title="Payment Received" desc="₹250 received for Property Mutation application." time="5 days ago" />
              <NotifItem title="Document Required" desc="Please re-upload discharge summary for Birth Certificate." time="1 week ago" />
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setProfileOpen((s) => !s); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg p-1.5 pr-2.5 hover:bg-muted"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {citizen?.fullName?.charAt(0) ?? "C"}
            </div>
            <span className="hidden text-sm font-medium text-foreground sm:block">{citizen?.fullName ?? "Citizen"}</span>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 animate-fade-in rounded-xl border border-border bg-white p-1.5 shadow-glossy-lg">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{citizen?.fullName}</p>
                <p className="text-xs text-muted-foreground">{citizen?.mobileNumber}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <div className="border-b border-border px-3 py-2 sm:hidden">
                <LanguageSwitcher />
              </div>
              <MenuLink icon={<User className="h-4 w-4" />} label={t("header.myProfile")} />
              <MenuLink icon={<Settings className="h-4 w-4" />} label={t("header.accountSettings")} />
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/5"
              >
                <LogOut className="h-4 w-4" /> {t("header.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NotifItem({ title, desc, time }: { title: string; desc: string; time: string }) {
  return (
    <div className="cursor-pointer rounded-lg px-2 py-2 hover:bg-muted">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground/70">{time}</p>
    </div>
  );
}

function MenuLink({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
      {icon} {label}
    </button>
  );
}
