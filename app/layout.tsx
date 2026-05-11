import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionGuard from "@/components/SessionGuard";

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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8481480017542259"
          crossOrigin="anonymous"
        />
      </head>

      <body
        className="min-h-full"
        style={{
          paddingBottom: "40px",
          background: "#020817",
        }}
      >
        <SessionGuard />

        {children}

        <footer
          style={{
            marginTop: 40,
            padding: "24px 16px",
            textAlign: "center",
            color: "rgba(255,255,255,0.7)",
            fontSize: 14,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <a
            href="/privacy"
            style={{
              color: "inherit",
              marginRight: 16,
              textDecoration: "none",
            }}
          >
            Politica de confidențialitate
          </a>

          <a
            href="/terms"
            style={{
              color: "inherit",
              marginRight: 16,
              textDecoration: "none",
            }}
          >
            Termeni și condiții
          </a>

          <a
            href="/contact"
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Contact
          </a>
        </footer>
      </body>
    </html>
  );
}