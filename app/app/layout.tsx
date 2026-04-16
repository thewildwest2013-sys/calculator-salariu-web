import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calculator Salariu",
  description: "Calculator salariu web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full"
        style={{
          paddingBottom: "90px",
        }}
      >
        {children}

        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            display: "flex",
            justifyContent: "center",
            padding: "8px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1200,
              minHeight: 70,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(7,19,38,0.96)",
              boxShadow: "0 0 30px rgba(0,0,0,0.25)",
              padding: "8px 10px",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                minHeight: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.78)",
                fontSize: 13,
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              Banner reclamă (placeholder)
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
