import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import SessionGuard from "@/components/SessionGuard";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://calculator-salariu-web.vercel.app"),
  title: {
    default: "Calculator Salariu – salariu net, programe, ture și firme",
    template: "%s | Calculator Salariu",
  },
  description: "Platformă web pentru estimarea salariului, ture, sporuri, concedii, istoric, profiluri și administrarea calculelor pentru firme.",
  applicationName: "Calculator Salariu",
  manifest: "/site.webmanifest",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/apple-touch-icon.png" },
  openGraph: {
    title: "Calculator Salariu",
    description: "Calcule salariale configurabile pentru persoane și companii.",
    url: "/",
    siteName: "Calculator Salariu",
    locale: "ro_RO",
    alternateLocale: ["en_US"],
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
    { media: "(prefers-color-scheme: light)", color: "#eef6ff" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body>
        <SessionGuard />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
