"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiShield, FiHome, FiLoader, FiArrowLeft } from "react-icons/fi";
import { LanguageProvider } from "@/lib/department-i18n";
import { DepartmentAuthProvider, useDepartmentAuth } from "@/context/DepartmentAuthContext";
import LanguageToggle from "@/components/department/LanguageToggle";

function LoginForm() {
  const router = useRouter();
  const { requestOtp, verifyOtp } = useDepartmentAuth();

  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    const result = await requestOtp(mobileNumber);
    setLoading(false);
    if (result.ok) {
      setStep("otp");
      setOtp(result.demoOtp || "");
      setDemoOtp(result.demoOtp || "");
    }
    else setError(result.error || "Could not send OTP.");
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    const result = await verifyOtp(mobileNumber, otp);
    setLoading(false);
    if (result.ok) router.push("/department/dashboard");
    else setError(result.error || "Incorrect OTP.");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <div className="relative overflow-hidden brand-gradient text-white lg:w-1/2 px-6 sm:px-10 lg:px-16 py-10 lg:py-0 flex flex-col justify-between min-h-[42vh] lg:min-h-screen">
        <div className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 opacity-[0.12] w-[420px] h-[420px] sm:w-[520px] sm:h-[520px]">
          <Image src="/smc-logo.png" alt="" fill className="object-contain" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center p-1.5 shrink-0">
              <Image src="/smc-logo.png" alt="SMC" width={48} height={48} className="object-contain rounded-lg" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight">SMC Department Portal</h1>
              <p className="text-xs sm:text-sm text-white/80 leading-tight">Solapur Municipal Corporation</p>
            </div>
          </div>
          <LanguageToggle variant="dark" />
        </div>

        <div className="relative z-10 py-8 lg:py-0">
          <span className="inline-flex items-center gap-2 text-xs font-medium bg-white/15 text-amber-200 px-3 py-1.5 rounded-full mb-5">
            <FiHome /> Staff Login
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight mb-4 max-w-md">
            Sign in to your department
          </h2>
          <p className="text-white/85 text-sm sm:text-base max-w-md leading-relaxed">
            No password to remember — verify with a one-time code sent to your registered mobile number.
          </p>
        </div>

        <div className="relative z-10 hidden lg:flex items-center gap-6 text-sm text-white/80 pb-10">
          <span className="flex items-center gap-2">
            <FiShield className="text-amber-300" /> Secure OTP sign-in
          </span>
        </div>

        <div className="relative z-10 hidden lg:block text-xs text-white/60 pb-6">
          © {new Date().getFullYear()} Solapur Municipal Corporation.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10 lg:py-0 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden justify-end mb-4">
            <LanguageToggle variant="dark" />
          </div>

          {step === "mobile" ? (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500 mb-7">Enter your registered mobile number to receive an OTP.</p>

              <form onSubmit={onRequestOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <span className="flex items-center justify-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#AC5288] focus:border-transparent"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full brand-gradient text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-[#AC5288]/20 hover:opacity-95 transition-opacity"
                >
                  {loading && <FiLoader className="animate-spin" />}
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep("mobile"); setError(null); setOtp(""); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <FiArrowLeft /> Change mobile number
              </button>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Enter OTP</h2>
              <p className="text-sm text-gray-500 mb-7">
                A 6-digit code was sent to +91 {mobileNumber}. It's valid for 5 minutes.
              </p>

              <form onSubmit={onVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                    One-Time Password
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg tracking-[0.4em] text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#AC5288] focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full brand-gradient text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-[#AC5288]/20 hover:opacity-95 transition-opacity"
                >
                  {loading && <FiLoader className="animate-spin" />}
                  {demoOtp && <p className="mt-2 text-xs text-amber-700">Demo OTP: <strong>{demoOtp}</strong></p>}
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>

                <button
                  type="button"
                  onClick={onRequestOtp}
                  disabled={loading}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Resend OTP
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-8">
            Trouble signing in? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentLoginPage() {
  return (
    <LanguageProvider>
      <DepartmentAuthProvider>
        <LoginForm />
      </DepartmentAuthProvider>
    </LanguageProvider>
  );
}
