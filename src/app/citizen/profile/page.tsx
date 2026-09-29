"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCitizenAuth } from "@/context/CitizenAuthContext";
import { useCitizenLanguage } from "@/context/CitizenLanguageContext";

export default function CitizenProfilePage() {
  const { citizen } = useCitizenAuth();
  const { t } = useCitizenLanguage();

  if (!citizen) return null;

  const fields: [string, string | undefined][] = [
    ["Full Name", citizen.fullName],
    ["Mobile Number", citizen.mobileNumber],
    ["Email", citizen.email],
    ["Aadhaar Number", citizen.aadhaarNumber],
    ["Address", citizen.addressLine1],
    ["City", citizen.city],
    ["State", citizen.state],
    ["Pincode", citizen.pincode],
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="font-display text-2xl font-bold text-primary-900">{t("header.myProfile")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{citizen.fullName}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border">
            {fields
              .filter(([, value]) => Boolean(value))
              .map(([label, value]) => (
                <div key={label} className="flex justify-between py-3 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-foreground">{value}</dd>
                </div>
              ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
