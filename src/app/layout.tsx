import type { Metadata } from "next";
import { Manrope, Tiro_Devanagari_Marathi } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { CitizenLanguageProvider } from "@/context/CitizenLanguageContext";
import { CitizenAuthProvider } from "@/context/CitizenAuthContext";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const tiroMarathi = Tiro_Devanagari_Marathi({
  subsets: ["devanagari"],
  weight: "400",
  variable: "--font-tiro-marathi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SMC Master Portal | सोलापूर महानगरपालिका",
  description: "Solapur Municipal Corporation — unified citizen, department and integrated-services portal",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Citizen Portal module fonts (Sora / Inter / Noto Sans Devanagari) — loaded at
            runtime so builds never depend on network access to Google Fonts. Falls back
            to system fonts automatically if unreachable. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} ${tiroMarathi.variable} font-sans`}>
        <LanguageProvider>
          <AuthProvider>
            <CitizenLanguageProvider>
              <CitizenAuthProvider>{children}</CitizenAuthProvider>
            </CitizenLanguageProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
