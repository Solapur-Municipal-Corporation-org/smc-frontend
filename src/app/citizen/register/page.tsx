"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  RotateCw,
  CheckCircle2,
  User,
  MapPin,
  UploadCloud,
  X,
} from "lucide-react";
import { AuthShell } from "@/components/citizen/layout/auth-shell";
import { Stepper } from "@/components/citizen/layout/stepper";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { authApi } from "@/lib/citizen-api";
import { useCitizenLanguage } from "@/context/CitizenLanguageContext";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry",
];

const genderOptions = ["Male", "Female", "Other"] as const;

const registrationSchema = z.object({
  // Step 1 — Basic Info (display order: name, DOB, gender, Aadhaar, mobile, email)
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(genderOptions, { required_error: "Select a gender" }),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Enter a valid 12-digit Aadhaar number"),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email address"),
  otp: z.string().length(6, "Enter the 6-digit OTP"),

  // Step 2 — Address
  addressLine1: z.string().min(5, "Address Line 1 must be at least 5 characters"),
  addressLine2: z.string().optional(),
  nearestLocation: z.string().min(2, "Enter a nearby landmark or location"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "Select a state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),

  // Step 3 — Documents
  acceptTerms: z.boolean().refine((v) => v === true, "You must accept the terms to continue"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const stepFields: Record<number, (keyof RegistrationForm)[]> = {
  1: ["firstName", "lastName", "dateOfBirth", "gender", "aadhaarNumber", "mobileNumber", "email", "otp"],
  2: ["addressLine1", "nearestLocation", "city", "state", "pincode"],
  3: ["acceptTerms"],
};

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useCitizenLanguage();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [furthestStep, setFurthestStep] = React.useState(1);
  const [serverError, setServerError] = React.useState("");
  const [documentFile, setDocumentFile] = React.useState<File | null>(null);
  const [documentError, setDocumentError] = React.useState("");

  const steps = [
    { label: t("register.stepBasicInfo"), icon: User },
    { label: t("register.stepAddress"), icon: MapPin },
    { label: t("register.stepDocuments"), icon: ShieldCheck },
  ];

  // Mobile OTP simulation state
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [generatedOtp, setGeneratedOtp] = React.useState("");
  const [sendingOtp, setSendingOtp] = React.useState(false);
  const [verifyingOtp, setVerifyingOtp] = React.useState(false);
  const [otpError, setOtpError] = React.useState("");
  const [resendTimer, setResendTimer] = React.useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationForm>({ resolver: zodResolver(registrationSchema), mode: "onChange" });

  const mobileNumber = watch("mobileNumber");
  const emailValue = watch("email");
  const otpValue = watch("otp");

  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  async function handleSendOtp() {
    // OTP is sent to both channels, so both must be valid first.
    const valid = await trigger(["mobileNumber", "email"]);
    if (!valid) return;
    setOtpError("");
    setSendingOtp(true);
    // In production: call authApi to trigger a real SMS OTP send.
    await new Promise((r) => setTimeout(r, 700));
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setOtpVerified(false);
    setValue("otp", "");
    setResendTimer(30);
    setSendingOtp(false);
  }

  async function handleVerifyOtp() {
    const valid = await trigger("otp");
    if (!valid) return;
    setVerifyingOtp(true);
    await new Promise((r) => setTimeout(r, 500));
    if (otpValue === generatedOtp) {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError("Incorrect OTP. Please try again.");
    }
    setVerifyingOtp(false);
  }

  async function handleNext() {
    if (currentStep === 1 && !otpVerified) {
      setOtpError((prev) => prev || "Please verify your mobile number with OTP before continuing.");
      return;
    }
    const valid = await trigger(stepFields[currentStep]);
    if (valid) {
      const next = Math.min(currentStep + 1, steps.length);
      setCurrentStep(next);
      setFurthestStep((f) => Math.max(f, next));
    }
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  function handleStepClick(step: number) {
    if (step <= furthestStep) setCurrentStep(step);
  }

  async function onSubmit(data: RegistrationForm) {
    setServerError("");
    setDocumentError("");

    if (!documentFile) {
      setDocumentError(t("register.documentRequired"));
      return;
    }

    const formData = new FormData();
    formData.append("FirstName", data.firstName);
    if (data.middleName) formData.append("MiddleName", data.middleName);
    formData.append("LastName", data.lastName);
    formData.append("Email", data.email);
    formData.append("DateOfBirth", data.dateOfBirth);
    formData.append("Gender", data.gender);
    formData.append("MobileNumber", data.mobileNumber);
    formData.append("AddressLine1", data.addressLine1);
    if (data.addressLine2) formData.append("AddressLine2", data.addressLine2);
    formData.append("NearestLocation", data.nearestLocation);
    formData.append("City", data.city);
    formData.append("State", data.state);
    formData.append("Pincode", data.pincode);
    formData.append("AadhaarNumber", data.aadhaarNumber);
    formData.append("Document", documentFile);

    try {
      await authApi.register(formData);
    } catch (err: unknown) {
      // Show the real error instead of silently pretending registration
      // succeeded — that used to hide genuine failures (backend down, DB
      // table missing, duplicate mobile/email/Aadhaar, validation errors).
      const response = (err as { response?: { data?: unknown; status?: number } })?.response;
      const data = response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;

      if (data?.message) {
        setServerError(data.message);
      } else if (data?.errors) {
        // ASP.NET ValidationProblem shape: { errors: { FieldName: ["msg", ...] } }
        const firstError = Object.values(data.errors)[0]?.[0];
        setServerError(firstError || "Registration failed. Please check your details and try again.");
      } else if (!response) {
        setServerError("Could not reach the server. Please check your internet connection and try again.");
      } else {
        setServerError("Registration failed. Please try again.");
      }
      return; // do NOT navigate away — the citizen was not actually created
    }
    router.push("/citizen/login?registered=1");
  }

  return (
    <AuthShell formTitle={t("register.title")} formSubtitle={t("register.subtitle")}>
      <Stepper steps={steps} currentStep={currentStep} furthestStep={furthestStep} onStepClick={handleStepClick} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <p className="mb-3 text-sm text-destructive">{serverError}</p>}

        {/* ---------------- STEP 1: Basic Info ---------------- */}
        <div className={currentStep === 1 ? "grid grid-cols-1 gap-4 animate-fade-in sm:grid-cols-2" : "hidden"}>
          <div>
            <Label htmlFor="firstName">{t("register.firstName")}<span className="text-destructive"> *</span></Label>
            <Input id="firstName" placeholder={t("register.firstNamePlaceholder")} error={errors.firstName?.message} {...register("firstName")} />
            {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
          </div>

          <div>
            <Label htmlFor="middleName">{t("register.middleName")}</Label>
            <Input id="middleName" placeholder={t("register.middleNamePlaceholder")} {...register("middleName")} />
          </div>

          <div>
            <Label htmlFor="lastName">{t("register.lastName")}<span className="text-destructive"> *</span></Label>
            <Input id="lastName" placeholder={t("register.lastNamePlaceholder")} error={errors.lastName?.message} {...register("lastName")} />
            {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
          </div>

          <div>
            <Label htmlFor="dateOfBirth">{t("register.dateOfBirth")}<span className="text-destructive"> *</span></Label>
            <Input id="dateOfBirth" type="date" error={errors.dateOfBirth?.message} {...register("dateOfBirth")} />
            {errors.dateOfBirth && <p className="mt-1 text-xs text-destructive">{errors.dateOfBirth.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="gender">{t("register.gender")}<span className="text-destructive"> *</span></Label>
            <Select onValueChange={(v) => setValue("gender", v as RegistrationForm["gender"], { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder={t("register.genderPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">{t("register.genderMale")}</SelectItem>
                <SelectItem value="Female">{t("register.genderFemale")}</SelectItem>
                <SelectItem value="Other">{t("register.genderOther")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="mt-1 text-xs text-destructive">{errors.gender.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="aadhaarNumber">{t("register.aadhaarNumber")}<span className="text-destructive"> *</span></Label>
            <Input
              id="aadhaarNumber"
              inputMode="numeric"
              maxLength={12}
              placeholder={t("register.aadhaarNumberPlaceholder")}
              error={errors.aadhaarNumber?.message}
              {...register("aadhaarNumber")}
            />
            {errors.aadhaarNumber && <p className="mt-1 text-xs text-destructive">{errors.aadhaarNumber.message}</p>}
          </div>

          <div>
            <Label htmlFor="mobileNumber">{t("register.mobileNo")}<span className="text-destructive"> *</span></Label>
            <Input
              id="mobileNumber"
              placeholder={t("register.mobileNoPlaceholder")}
              error={errors.mobileNumber?.message}
              disabled={otpSent}
              {...register("mobileNumber", {
                onChange: () => {
                  setOtpSent(false);
                  setOtpVerified(false);
                },
              })}
            />
            {errors.mobileNumber && <p className="mt-1 text-xs text-destructive">{errors.mobileNumber.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">{t("register.email")}<span className="text-destructive"> *</span></Label>
            <Input
              id="email"
              type="email"
              placeholder={t("register.emailPlaceholder")}
              error={errors.email?.message}
              disabled={otpSent}
              {...register("email", {
                onChange: () => {
                  setOtpSent(false);
                  setOtpVerified(false);
                },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-start gap-2 rounded-lg bg-primary-50/60 p-3 text-xs text-primary-800">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{t("register.otpNote")}</span>
            </div>
          </div>

          <div className="sm:col-span-2">
            {!otpSent ? (
              <Button type="button" variant="outline" onClick={handleSendOtp} disabled={sendingOtp || !mobileNumber || !emailValue}>
                {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : t("register.sendOtp")}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setOtpSent(false);
                  setOtpVerified(false);
                }}
              >
                {t("register.change")}
              </Button>
            )}
          </div>

          {otpSent && (
            <div className="animate-fade-in sm:col-span-2">
              <Label htmlFor="otp">{t("register.enterOtp")}</Label>
              <div className="flex gap-2">
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t("register.enterOtp")}
                  disabled={otpVerified}
                  error={errors.otp?.message || otpError}
                  {...register("otp")}
                />
                {!otpVerified ? (
                  <Button type="button" className="shrink-0" onClick={handleVerifyOtp} disabled={verifyingOtp}>
                    {verifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : t("register.verify")}
                  </Button>
                ) : (
                  <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-green-50 px-3 text-sm font-medium text-green-700">
                    <CheckCircle2 className="h-4 w-4" /> {t("register.verified")}
                  </div>
                )}
              </div>
              {(errors.otp || otpError) && <p className="mt-1 text-xs text-destructive">{otpError || errors.otp?.message}</p>}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-800">
                  {t("register.demoOtpNote")}: <strong>{generatedOtp}</strong> (simulated — no real SMS sent)
                </span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendTimer > 0 || sendingOtp}
                  className="flex items-center gap-1 font-medium text-primary-600 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                >
                  <RotateCw className="h-3 w-3" />
                  {resendTimer > 0 ? `${t("register.resendIn")} ${resendTimer}s` : t("register.resendOtp")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---------------- STEP 2: Address ---------------- */}
        <div className={currentStep === 2 ? "grid grid-cols-1 gap-4 animate-fade-in sm:grid-cols-2" : "hidden"}>
          <div className="sm:col-span-2">
            <Label htmlFor="addressLine1">{t("register.addressLine1")}<span className="text-destructive"> *</span></Label>
            <Input id="addressLine1" placeholder={t("register.addressLine1Placeholder")} error={errors.addressLine1?.message} {...register("addressLine1")} />
            {errors.addressLine1 && <p className="mt-1 text-xs text-destructive">{errors.addressLine1.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="addressLine2">{t("register.addressLine2")}</Label>
            <Input id="addressLine2" placeholder={t("register.addressLine2Placeholder")} {...register("addressLine2")} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="nearestLocation">{t("register.nearestLocation")}<span className="text-destructive"> *</span></Label>
            <Input id="nearestLocation" placeholder={t("register.nearestLocationPlaceholder")} error={errors.nearestLocation?.message} {...register("nearestLocation")} />
            {errors.nearestLocation && <p className="mt-1 text-xs text-destructive">{errors.nearestLocation.message}</p>}
          </div>

          <div>
            <Label htmlFor="city">{t("register.city")}<span className="text-destructive"> *</span></Label>
            <Input id="city" placeholder={t("register.cityPlaceholder")} error={errors.city?.message} {...register("city")} />
            {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
          </div>

          <div>
            <Label htmlFor="state">{t("register.state")}<span className="text-destructive"> *</span></Label>
            <Select onValueChange={(v) => setValue("state", v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder={t("register.statePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {indianStates.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="pincode">{t("register.pincode")}<span className="text-destructive"> *</span></Label>
            <Input id="pincode" placeholder={t("register.pincodePlaceholder")} error={errors.pincode?.message} {...register("pincode")} />
            {errors.pincode && <p className="mt-1 text-xs text-destructive">{errors.pincode.message}</p>}
          </div>
        </div>

        {/* ---------------- STEP 3: Documents ---------------- */}
        <div className={currentStep === 3 ? "grid grid-cols-1 gap-4 animate-fade-in sm:grid-cols-2" : "hidden"}>
          <div className="sm:col-span-2">
            <Label>{t("register.uploadDocument")}<span className="text-destructive"> *</span></Label>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{documentFile ? documentFile.name : t("register.uploadDocumentDesc")}</p>
                  <p className="text-xs text-muted-foreground">{t("register.uploadDocumentHint")}</p>
                </div>
              </div>
              {documentFile ? (
                <button type="button" onClick={() => setDocumentFile(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <label className="cursor-pointer">
                  <span className="inline-flex h-9 items-center rounded-lg border border-border bg-white px-3 text-sm font-medium hover:bg-muted">
                    {t("register.upload")}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      setDocumentFile(e.target.files?.[0] ?? null);
                      setDocumentError("");
                    }}
                  />
                </label>
              )}
            </div>
            {documentError && <p className="mt-1 text-xs text-destructive">{documentError}</p>}
          </div>

          <label className="flex items-start gap-2 pt-1 text-sm text-muted-foreground sm:col-span-2">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-input" {...register("acceptTerms")} />
            {t("register.termsLabel")}
          </label>
          {errors.acceptTerms && <p className="text-xs text-destructive sm:col-span-2">{errors.acceptTerms.message}</p>}
        </div>

        {/* ---------------- Navigation ---------------- */}
        <div className="mt-6 flex gap-3">
          {currentStep > 1 && (
            <Button type="button" variant="outline" size="lg" className="flex-1" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" /> {t("common.back")}
            </Button>
          )}

          {currentStep < steps.length ? (
            <Button type="button" size="lg" className="flex-1" onClick={handleNext}>
              {t("common.continue")} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {isSubmitting ? t("register.creatingAccount") : t("register.createAccount")}
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("auth.alreadyRegistered")}{" "}
          <Link href="/citizen/login" className="font-semibold text-primary-600 hover:underline">
            {t("auth.signInInstead")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
