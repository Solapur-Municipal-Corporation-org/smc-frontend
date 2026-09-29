"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, UploadCloud, FileText, Loader2, ArrowLeft, X, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { currentFinancialYear } from "@/lib/utils";
import { PaymentDialog } from "@/components/citizen/services/payment-dialog";
import { cn } from "@/lib/utils";
import { api, applicationsApi, catalogApi } from "@/lib/citizen-api";
import { useCitizenAuth } from "@/context/CitizenAuthContext";
import type { Citizen } from "@/types/citizen-portal";

export default function ServiceApplicationPage() {
  const params = useParams<{ serviceId: string }>();
  const router = useRouter();
  const [service, setService] = React.useState<any>(null);
  const [loadFailed, setLoadFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setService(null);
    setLoadFailed(false);
    catalogApi.getService(params.serviceId)
      .then((response) => {
        if (!cancelled) setService(response.data);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => { cancelled = true; };
  }, [params.serviceId]);

  if (!service && !loadFailed) {
    return <div className="flex justify-center p-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (loadFailed || !service) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-16 text-center">
        <p className="font-display text-lg font-semibold text-foreground">Service not found</p>
        <p className="mt-1 text-sm text-muted-foreground">This service may have been moved or renamed.</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/citizen/services")}>
          Back to Services
        </Button>
      </div>
    );
  }

  const department = { code: service.departmentCode, name: service.departmentName };
  return service.name.trim().toLowerCase() === "tree cutting"
    ? <TreeCuttingFlow service={service} department={department} />
    : <ServiceGenericApplication service={service} department={department} />;
}

function getTreeFieldId(field: any): string {
  const fieldIds: Record<string, string> = {
    "application type": "applicationType",
    "applicant type": "applicantType",
    "full name": "fullName",
    address: "address",
    "email id": "emailId",
    "mobile number": "mobileNo",
    "aadhar number": "aadharNo",
    "peth name": "petName",
    "peth number": "pethNo",
    "zone number": "zoneNo",
    "prabhag number": "prabhagNo",
    "property tax number": "propertyTaxNo",
    "tree address": "treeAddress",
    "tree cutting reason": "treeCuttingReason",
    "number of trees": "numberOfTreeCutting",
    "tree species": "treeSpecies",
  };

  return fieldIds[field.label.trim().toLowerCase()] ?? field.id;
}

function getCitizenFieldValue(label: string, citizen: Citizen | null | undefined): string {
  const normalized = label.trim().toLowerCase();
  const values: Record<string, string | undefined | null> = {
    "full name": citizen?.fullName,
    address: citizen?.addressLine1,
    "email id": citizen?.email,
    "mobile number": citizen?.mobileNumber,
    "aadhar number": citizen?.aadhaarNumber,
    "aadhaar number": citizen?.aadhaarNumber,
    city: citizen?.city,
    state: citizen?.state,
    pincode: citizen?.pincode,
  };
  return values[normalized] ?? "";
}

function isCitizenField(label: string): boolean {
  return ["full name", "address", "email id", "mobile number", "aadhar number", "aadhaar number", "city", "state", "pincode"]
    .includes(label.trim().toLowerCase());
}

function ServiceGenericApplication({ service, department }: { service: any; department: any }) {
  const router = useRouter();
  const { citizen } = useCitizenAuth();
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [files, setFiles] = React.useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [applicationNumber, setApplicationNumber] = React.useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [applicationTypes, setApplicationTypes] = React.useState<any[]>([]);
  const [applicantTypes, setApplicantTypes] = React.useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = React.useState(true);
  const [loadingApplicantTypes, setLoadingApplicantTypes] = React.useState(false);
  const selectedApplicationTypeId = values.applicationType;

  React.useEffect(() => {
    if (!citizen || !service?.fields) return;
    setValues((current) => {
      const next = { ...current };
      for (const field of service.fields) {
        if (!next[field.id]) {
          const value = getCitizenFieldValue(field.label, citizen);
          if (value) next[field.id] = value;
        }
      }
      return next;
    });
  }, [citizen, service?.fields]);

  React.useEffect(() => {
    let ignore = false;

    const fetchApplicationTypes = async () => {
      try {
        setLoadingTypes(true);
        const response = await catalogApi.getApplicationTypesForService(department.code, service.id);
        if (!ignore) setApplicationTypes(response.data || []);
      } catch (err) {
        console.error("Failed to fetch application types:", err);
        if (!ignore) setApplicationTypes([]);
      } finally {
        if (!ignore) setLoadingTypes(false);
      }
    };

    if (service?.id) {
      setValues((current) => {
        const next = { ...current };
        delete next.applicationType;
        delete next.applicantType;
        return next;
      });
      setApplicantTypes([]);
      fetchApplicationTypes();
    }

    return () => {
      ignore = true;
    };
  }, [department.code, service?.id, service?.name]);

  React.useEffect(() => {
    let ignore = false;
    if (selectedApplicationTypeId) {
      const fetchApplicantTypes = async () => {
        try {
          setLoadingApplicantTypes(true);
          const response = await catalogApi.getApplicantTypesForService(department.code, service.id, selectedApplicationTypeId);
          if (!ignore) setApplicantTypes(response.data || []);
        } catch (err) {
          console.error("Failed to fetch applicant types:", err);
          if (!ignore) setApplicantTypes([]);
        } finally {
          if (!ignore) setLoadingApplicantTypes(false);
        }
      };

      fetchApplicantTypes();
    } else {
      setApplicantTypes([]);
      setLoadingApplicantTypes(false);
    }

    return () => {
      ignore = true;
    };
  }, [department.code, service?.id, selectedApplicationTypeId]);

  function updateField(id: string, val: string) {
    setValues((v) => {
      const next = { ...v, [id]: val };
      // Applicant types are dependent on the selected application type, so a
      // previous selection must never be submitted for a newly selected type.
      if (id === "applicationType") delete next.applicantType;
      return next;
    });
    setErrors((e) => ({ ...e, [id]: "" }));
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    
    // Check application type if available
    if (applicationTypes.length > 0 && !values["applicationType"]?.trim()) {
      newErrors["applicationType"] = "Application Type is required";
    }
    
    // Check applicant type if available
    if (applicantTypes.length > 0 && !values["applicantType"]?.trim()) {
      newErrors["applicantType"] = "Applicant Type is required";
    }
    
    for (const field of service.fields) {
      if (["application type", "applicant type"].includes(field.label.trim().toLowerCase())) continue;
      if (field.required && !values[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("serviceId", service.id);
      payload.append("formDataJson", JSON.stringify(values));
      Object.values(files).filter((file): file is File => file instanceof File).forEach((file) => payload.append("documents", file));
      const response = await api.post("/applications", payload, { headers: { "Content-Type": "multipart/form-data" } });
      setApplicationNumber(response.data.applicationNumber);
    } catch {
      setErrors((current) => ({ ...current, form: "Could not submit the application. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  }

  if (applicationNumber) {
    return (
      <div className="mx-auto max-w-2xl animate-fade-in">
        <Card className="overflow-hidden">
          <div className="bg-gov-gradient px-6 py-8 text-center text-white">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/10">
              <CheckCircle2 className="h-7 w-7 text-accent-500" />
            </div>
            <h2 className="font-display text-xl font-bold">Application Submitted Successfully</h2>
            <p className="mt-1 text-sm text-white/75">{service.name} · {department.name}</p>
          </div>
          <CardContent className="space-y-5 p-6">
            <div className="rounded-lg border border-dashed border-primary-200 bg-primary-50/60 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-primary-700/70">Your Application Number</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-wide text-primary-800">{applicationNumber}</p>
              <p className="mt-1 text-xs text-muted-foreground">Financial Year {currentFinancialYear()} · Keep this for tracking</p>
            </div>

            {service.fee > 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border p-4 sm:flex-row sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="text-sm font-semibold text-foreground">Application Fee</p>
                  <p className="text-xs text-muted-foreground">Payment is required to process your application.</p>
                </div>
                <Button onClick={() => setPaymentOpen(true)} className="w-full sm:w-auto">
                  <IndianRupee className="h-4 w-4" /> Pay ₹{service.fee} Now
                </Button>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">No fee is applicable for this service.</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={() => router.push(`/citizen/applications?applicationNumber=${applicationNumber}`)}>
                Track This Application
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => router.push("/citizen/services")}>
                Apply for Another Service
              </Button>
            </div>
          </CardContent>
        </Card>

        <PaymentDialog
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          applicationNumber={applicationNumber}
          amount={service.fee}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-5">
      <button
        onClick={() => router.push("/citizen/services")}
        className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Services
      </button>

      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{department.name}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={service.fee > 0 ? "accent" : "outline"}>{service.fee > 0 ? `₹${service.fee} fee` : "Free"}</Badge>
              <Badge variant="outline">{service.processingDays} day processing</Badge>
            </div>
          </div>
          <p className="pt-2 text-sm text-muted-foreground">{service.description}</p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Application Type Dropdown */}
            {service.fields.some((field: any) => field.label.trim().toLowerCase() === "application type") && (
              <div>
                <Label htmlFor="applicationType">
                  Application Type
                  <span className="text-destructive"> *</span>
                </Label>
                {loadingTypes ? (
                  <div className="rounded border border-border bg-muted p-2 text-sm text-muted-foreground">
                    Loading options...
                  </div>
                ) : applicationTypes.length ? (
                  <>
                    <Select value={values["applicationType"] || ""} onValueChange={(v) => updateField("applicationType", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Application Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {applicationTypes.map((appType: any) => (
                          <SelectItem key={appType.id} value={appType.id}>
                            {appType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors["applicationType"] && (
                      <p className="mt-1 text-xs text-destructive">{errors["applicationType"]}</p>
                    )}
                  </>
                ) : <p className="mt-1 text-xs text-destructive">No application types are configured for this service.</p>}
              </div>
            )}

            {/* Applicant Type Dropdown (shown when Application Type is selected) */}
            {service.fields.some((field: any) => field.label.trim().toLowerCase() === "applicant type") && values["applicationType"] && (
              <div>
                <Label htmlFor="applicantType">
                  Applicant Type
                  <span className="text-destructive"> *</span>
                </Label>
                {loadingApplicantTypes ? (
                  <div className="rounded border border-border bg-muted p-2 text-sm text-muted-foreground">
                    Loading options...
                  </div>
                ) : applicantTypes.length ? <Select value={values["applicantType"] || ""} onValueChange={(v) => updateField("applicantType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Applicant Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicantTypes.map((appType: any) => (
                      <SelectItem key={appType.id} value={appType.id}>
                        {appType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> : <p className="mt-1 text-xs text-destructive">No applicant types are configured for this application type.</p>}
                {errors["applicantType"] && (
                  <p className="mt-1 text-xs text-destructive">{errors["applicantType"]}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {service.fields.filter((field: any) => !["application type", "applicant type"].includes(field.label.trim().toLowerCase())).map((field: any) => (
                <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <Label htmlFor={field.id}>{field.label}{field.required && <span className="text-destructive"> *</span>}</Label>
                  {field.type === "select" ? (
                    <Select value={values[field.id] || ""} onValueChange={(v) => updateField(field.id, v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt: string) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      value={values[field.id] || ""}
                      disabled={isCitizenField(field.label)}
                      onChange={(e) => updateField(field.id, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={values[field.id] || ""}
                      disabled={isCitizenField(field.label)}
                      onChange={(e) => updateField(field.id, e.target.value)}
                      error={errors[field.id]}
                    />
                  )}
                  {errors[field.id] && <p className="mt-1 text-xs text-destructive">{errors[field.id]}</p>}
                </div>
              ))}
            </div>

            <div>
              <Label>Required Documents</Label>
              <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
                {service.documentsRequired.map((doc: string) => (
                  <DocumentUpload
                    key={doc}
                    label={doc}
                    file={files[doc] ?? null}
                    onChange={(f) => setFiles((prev) => ({ ...prev, [doc]: f }))}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {submitting ? "Submitting Application..." : "Submit Application"}
            </Button>
            {errors.form && <p className="text-center text-sm text-destructive">{errors.form}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function TreeCuttingFlow({ service, department }: { service: any; department: any }) {
  const router = useRouter();
  const { citizen } = useCitizenAuth();
  const [step, setStep] = React.useState(1);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [documents, setDocuments] = React.useState<Record<string, File | null>>({});
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [submittedApplicationNumber, setSubmittedApplicationNumber] = React.useState<string | null>(null);
  const [applicationTypes, setApplicationTypes] = React.useState<any[]>([]);
  const [applicantTypes, setApplicantTypes] = React.useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = React.useState(true);
  const [loadingApplicantTypes, setLoadingApplicantTypes] = React.useState(false);

  React.useEffect(() => {
    if (!citizen || !service?.fields) return;
    setValues((current) => {
      const next = { ...current };
      for (const field of service.fields) {
        const fieldId = getTreeFieldId(field);
        if (!next[fieldId]) {
          const value = getCitizenFieldValue(field.label, citizen);
          if (value) next[fieldId] = value;
        }
      }
      return next;
    });
  }, [citizen, service?.fields]);

  React.useEffect(() => {
    let ignore = false;
    async function loadApplicationTypes() {
      try {
        const response = await api.get<Record<string, string[]>>("/treecutting/options");
        if (!ignore) {
          setApplicationTypes((response.data.applicationType ?? []).map((name) => ({ value: name, name })));
          setApplicantTypes((response.data.applicantType ?? []).map((name) => ({ value: name, name })));
        }
      } catch {
        if (!ignore) setApplicationTypes([]);
      } finally {
        if (!ignore) setLoadingTypes(false);
      }
    }
    loadApplicationTypes();
    return () => {
      ignore = true;
    };
  }, [service.id]);

  const steps = [
    "Applicant & Property Information",
    "Tree Information",
    "Required Documents & Tree Photographs",
    "Preview",
  ];

  function updateField(id: string, val: string) {
    setValues((v) => ({ ...v, [id]: val }));
    setErrors((e) => ({ ...e, [id]: "" }));
  }

  function validateApplicant() {
    const nextErrors: Record<string, string> = {};
    const required = ["applicationType","applicantType","fullName","address","emailId","mobileNo","aadharNo","petName","pethNo","zoneNo","prabhagNo","propertyTaxNo"];
    for (const field of required) {
      if (!values[field]?.trim()) nextErrors[field] = `${service.fields.find((f: any) => getTreeFieldId(f) === field)?.label || field} is required`;
    }
    const email = values.emailId || "";
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) nextErrors.emailId = "Please enter a valid email address.";
    const mobile = values.mobileNo || "";
    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) nextErrors.mobileNo = "Please enter a valid mobile number starting with 6, 7, 8 or 9.";
    const aadhaar = values.aadharNo || "";
    if (aadhaar && !/^\d{12}$/.test(aadhaar)) nextErrors.aadharNo = "Aadhar number must contain exactly 12 digits.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateTreeInfo() {
    const nextErrors: Record<string, string> = {};
    const required = ["treeAddress","treeCuttingReason","treeSpecies"];
    for (const field of required) {
      if (!values[field]?.trim()) nextErrors[field] = `${service.fields.find((f: any) => getTreeFieldId(f) === field)?.label || field} is required`;
    }
    const treeCount = Number(values.numberOfTreeCutting ?? 0);
    if (!values.numberOfTreeCutting?.trim()) nextErrors.numberOfTreeCutting = "Number of Trees is required";
    else if (!Number.isInteger(treeCount) || treeCount < 1) nextErrors.numberOfTreeCutting = "Number of Trees must be at least 1";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateDocs() {
    const missing = service.documentsRequired.filter((doc: string) => !documents[doc]);
    if (missing.length) {
      setErrors({ documents: "Please upload all required documents." });
      return false;
    }
    return true;
  }

  function validatePhotos() {
    if (photos.length === 0) {
      setErrors({ photos: "Please upload at least one tree photograph." });
      return false;
    }
    return true;
  }

  async function submitApplication() {
    if (!validateApplicant()) return;
    if (!validateTreeInfo()) return;
    if (!validateDocs()) return;
    if (!validatePhotos()) return;
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("serviceId", service.id);
      payload.append("formDataJson", JSON.stringify(values));
      Object.values(documents).filter((file): file is File => file instanceof File).forEach((file) => payload.append("documents", file));
      photos.forEach((photo) => payload.append("documents", photo));
      const response = await applicationsApi.create(payload);
      setSubmittedApplicationNumber(response.data.applicationNumber);
      setErrors({});
    } catch (error: any) {
      setErrors((current) => ({ ...current, form: error?.response?.data?.message || "Could not submit the application. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-5">
      <button onClick={() => router.push("/citizen/services")} className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Services
      </button>

      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{department.name}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{service.processingDays} day processing</Badge>
              <Badge variant={service.fee > 0 ? "accent" : "outline"}>{service.fee > 0 ? `₹${service.fee} fee` : "Free"}</Badge>
            </div>
          </div>
          <p className="pt-2 text-sm text-muted-foreground">{service.description}</p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-6 flex flex-wrap gap-2">
            {steps.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <button type="button" className={cn("rounded-full px-3 py-1 text-xs font-semibold", step === index + 1 ? "bg-primary-700 text-white" : "bg-muted text-muted-foreground")}>{index + 1}</button>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {service.fields.filter((field: any) => ["applicationType","applicantType","fullName","address","emailId","mobileNo","aadharNo","petName","pethNo","zoneNo","prabhagNo","propertyTaxNo"].includes(getTreeFieldId(field))).map((field: any) => {
                const fieldId = getTreeFieldId(field);
                return <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <Label htmlFor={fieldId}>{field.label}{field.required && <span className="text-destructive"> *</span>}</Label>
                  {field.type === "select" ? (
                    fieldId === "applicationType" && loadingTypes ? (
                      <div className="rounded border border-border bg-muted p-2 text-sm text-muted-foreground">Loading options...</div>
                    ) : fieldId === "applicantType" && loadingApplicantTypes ? (
                      <div className="rounded border border-border bg-muted p-2 text-sm text-muted-foreground">Loading options...</div>
                    ) : (
                    <Select value={values[fieldId] || ""} disabled={isCitizenField(field.label)} onValueChange={(v) => updateField(fieldId, v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(fieldId === "applicationType"
                          ? applicationTypes.map((option: any) => ({ value: option.value, label: option.name }))
                          : fieldId === "applicantType"
                            ? applicantTypes.map((option: any) => ({ value: option.value, label: option.name }))
                            : (field.options ?? []).map((option: string) => ({ value: option, label: option }))
                        ).map((option: { value: string; label: string }) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    )
                  ) : field.type === "textarea" ? (
                    <Textarea id={fieldId} value={values[fieldId] || ""} disabled={isCitizenField(field.label)} onChange={(e) => updateField(fieldId, e.target.value)} placeholder={field.placeholder} />
                  ) : (
                    <Input id={fieldId} type={field.type} value={values[fieldId] || ""} disabled={isCitizenField(field.label)} onChange={(e) => updateField(fieldId, e.target.value)} placeholder={field.placeholder} error={errors[fieldId]} />
                  )}
                  {errors[fieldId] && <p className="mt-1 text-xs text-destructive">{errors[fieldId]}</p>}
                </div>;
              })}
              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button variant="outline" onClick={() => router.push("/citizen/services")}>Cancel</Button>
                <Button onClick={() => { if (validateApplicant()) setStep(2); }}>Next</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {service.fields.filter((field: any) => ["treeAddress","treeCuttingReason","numberOfTreeCutting","treeSpecies"].includes(getTreeFieldId(field))).map((field: any) => {
                const fieldId = getTreeFieldId(field);
                return <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <Label htmlFor={fieldId}>{field.label}{field.required && <span className="text-destructive"> *</span>}</Label>
                  {field.type === "textarea" ? (
                    <Textarea id={fieldId} value={values[fieldId] || ""} onChange={(e) => updateField(fieldId, e.target.value)} placeholder={field.placeholder} />
                  ) : (
                    <Input id={fieldId} type={field.type} value={values[fieldId] || ""} onChange={(e) => updateField(fieldId, e.target.value)} placeholder={field.placeholder} error={errors[fieldId]} />
                  )}
                  {errors[fieldId] && <p className="mt-1 text-xs text-destructive">{errors[fieldId]}</p>}
                </div>;
              })}
              <div className="sm:col-span-2 flex justify-between gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)}>Save Draft</Button>
                  <Button onClick={() => { if (validateTreeInfo()) setStep(3); }}>Next</Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed border-border p-4">
                <p className="font-semibold text-foreground">Required Documents</p>
                <div className="mt-3 space-y-3">
                  {service.documentsRequired.map((doc: string) => (
                    <DocumentUploadTree
                      key={doc}
                      label={doc}
                      file={documents[doc] ?? null}
                      onChange={(f) => {
                        setDocuments((prev) => ({ ...prev, [doc]: f }));
                        setErrors((e) => ({ ...e, documents: "" }));
                      }}
                      maxSizeMb={5}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-border p-4">
                <p className="font-semibold text-foreground">Tree Photographs</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {photos.length > 0 ? photos.map((photo, idx) => (
                    <div key={idx} className="rounded-lg border border-border bg-muted/40 p-2">
                      <span className="text-xs">{photo.name}</span>
                      <button className="ml-2 text-xs text-destructive" onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}>Delete</button>
                    </div>
                  )) : <span className="text-sm text-muted-foreground">No photos uploaded</span>}
                </div>
                <div className="mt-4">
                  <Input type="file" accept="image/jpeg,image/png,image/jpg" multiple onChange={(e) => {
                    const incoming = Array.from(e.target.files ?? []);
                    const valid = incoming.filter((f) => /image\/(jpeg|png|jpg)/.test(f.type) && f.size <= 5 * 1024 * 1024);
                    if (incoming.length > 0 && valid.length !== incoming.length) {
                      setErrors({ photos: "Photos must be JPG, JPEG, or PNG and 5 MB or less." });
                      return;
                    }
                    setPhotos(valid);
                    setErrors((e) => ({ ...e, photos: "" }));
                  }} />
                </div>
                {errors.photos && <p className="mt-2 text-xs text-destructive">{errors.photos}</p>}
              </div>
              {errors.documents && <p className="text-xs text-destructive">{errors.documents}</p>}
              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={() => { if (validateDocs() && validatePhotos()) setStep(4); }}>Next</Button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-5">
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-display text-lg font-semibold">Application Information</h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {service.fields.map((field: any) => (
                    <div key={field.id} className="rounded-md border border-border bg-muted/30 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{field.label}</div>
                      <div className="mt-1 text-sm text-foreground">{values[getTreeFieldId(field)] || "-"}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="font-display text-lg font-semibold">Documents</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {service.documentsRequired.map((doc: string) => <Badge key={doc} variant="outline">{doc}: {documents[doc] ? documents[doc]!.name : "Missing"}</Badge>)}
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="font-display text-lg font-semibold">Photographs</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {photos.map((photo, idx) => <Badge key={idx} variant="outline">{photo.name}</Badge>)}
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => window.print()} disabled={!submittedApplicationNumber}>Print</Button>
                  <Button onClick={submitApplication} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </div>
              {submittedApplicationNumber && (
                <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
                  Application submitted successfully. Application number: <strong>{submittedApplicationNumber}</strong>
                </div>
              )}
              {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
            </div>
          )}
          {errors.documents && <p className="mt-2 text-xs text-destructive">{errors.documents}</p>}
          {errors.photos && <p className="mt-2 text-xs text-destructive">{errors.photos}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentUploadTree({ label, file, onChange, maxSizeMb }: { label: string; file: File | null; onChange: (f: File | null) => void; maxSizeMb: number }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
          <UploadCloud className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{file ? file.name : `PDF, JPG or PNG, max ${maxSizeMb}MB`}</p>
        </div>
      </div>
      {file ? (
        <button type="button" onClick={() => onChange(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      ) : (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Upload
          </Button>
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => {
            const item = e.target.files?.[0] ?? null;
            if (item && item.size > maxSizeMb * 1024 * 1024) {
              alert(`Each document must be ${maxSizeMb} MB or less.`);
              return;
            }
            onChange(item);
          }} />
        </>
      )}
    </div>
  );
}

function DocumentUpload({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
          <UploadCloud className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{file ? file.name : "PDF, JPG or PNG, max 5MB"}</p>
        </div>
      </div>
      {file ? (
        <button type="button" onClick={() => onChange(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      ) : (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        </>
      )}
    </div>
  );
}
