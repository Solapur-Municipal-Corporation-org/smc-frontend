"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn, AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/citizen/layout/auth-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCitizenAuth } from "@/context/CitizenAuthContext";
import { useCitizenLanguage } from "@/context/CitizenLanguageContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const { requestOtp, verifyOtp } = useCitizenAuth();
  const { t } = useCitizenLanguage();

  const [mobileNumber, setMobileNumber] = React.useState("");
  const [mobileError, setMobileError] = React.useState("");
  const [error, setError] = React.useState("");
  const [notRegistered, setNotRegistered] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [otpError, setOtpError] = React.useState("");
  const [demoOtp, setDemoOtp] = React.useState("");

  async function handleRequestOtp() {
    const mobile = mobileNumber.trim();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMobileError("Enter a valid 10-digit mobile number");
      return;
    }
    setMobileError("");
    setError("");
    setNotRegistered(false);
    setLoading(true);
    const result = await requestOtp(mobile);
    setLoading(false);
    if (result.ok) {
      setOtpSent(true);
      setOtp(result.demoOtp || "");
      setOtpError("");
      setDemoOtp(result.demoOtp || "");
    } else if (result.error?.toLowerCase().includes("not registered")) {
      setNotRegistered(true);
    } else {
      setError(result.error || "Could not send OTP. Please try again.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mobile = mobileNumber.trim();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMobileError("Enter a valid 10-digit mobile number");
      return;
    }

    setError("");
    setNotRegistered(false);
    if (!otpSent || !/^\d{6}$/.test(otp)) {
      setOtpError("Enter the 6-digit OTP sent to your mobile number");
      return;
    }
    setLoading(true);
    const result = await verifyOtp(mobile, otp);
    setLoading(false);

    if (result.ok) {
      setOtpVerified(true);
      router.push("/citizen/dashboard");
    } else if (result.error?.toLowerCase().includes("not registered")) {
      setNotRegistered(true);
    } else {
      setError(result.error || "Login failed. Please try again.");
    }
  }

  return (
    <AuthShell formTitle={t("auth.welcomeBack")} formSubtitle={t("auth.signInSubtitle")}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {justRegistered && (
          <div className="flex items-start gap-2 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t("auth.registeredSuccess")}</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notRegistered && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              We couldn&apos;t find an account with that mobile number.{" "}
              <Link href="/citizen/register" className="font-semibold underline underline-offset-2">
                Create one now
              </Link>
              .
            </span>
          </div>
        )}

        <div>
          <Label htmlFor="mobileNumber">{t("register.mobileNo")}</Label>
          <div className="flex gap-2">
            <Input
              id="mobileNumber"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder={t("register.mobileNoPlaceholder")}
              value={mobileNumber}
              disabled={otpSent}
              error={mobileError}
              onChange={(e) => {
                setMobileNumber(e.target.value.replace(/\D/g, ""));
                setMobileError("");
                setNotRegistered(false);
              }}
            />
            <Button type="button" variant="outline" className="shrink-0" onClick={handleRequestOtp} disabled={loading || otpSent}>
              {loading && !otp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
            </Button>
          </div>
          {mobileError && <p className="mt-1 text-xs text-destructive">{mobileError}</p>}
        </div>

        {otpSent && (
          <div>
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              type="tel"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit OTP"
              value={otp}
              error={otpError}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setOtpError("");
              }}
            />
            {otpError && <p className="mt-1 text-xs text-destructive">{otpError}</p>}
            {demoOtp && (
              <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Demo OTP: <strong>{demoOtp}</strong>
              </p>
            )}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading || !otpSent || otpVerified}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {loading ? t("auth.signingIn") : t("auth.signIn")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.newToPortal")}{" "}
          <Link href="/citizen/register" className="font-semibold text-primary-600 hover:underline">
            {t("auth.registerLink")}
          </Link>
        </p>

      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}
