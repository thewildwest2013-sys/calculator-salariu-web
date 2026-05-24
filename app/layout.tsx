import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionGuard from "@/components/SessionGuard";
import ClientTextTranslator from "@/components/ClientTextTranslator";


export const metadata: Metadata = {
  title: "Salary Calculator 2026 - Calculator salariu net, ture și sporuri",
  description:
    "Salary Calculator te ajută să estimezi salariul net, turele, sporul de noapte, weekendurile, sărbătorile legale și istoricul calculelor.",
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Salary Calculator 2026",
    description:
      "Calculate salary net, sporurile, turele și exportă istoricul calculelor.",
    url: "https://calculator-salariu-web.vercel.app",
    siteName: "Salary Calculator",
    locale: "ro_RO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#020817",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className="h-full antialiased"
    >
      <body
        className="min-h-full"
        style={{
          paddingBottom: "40px",
          background: "#020817",
        }}
      >
        <SessionGuard />
          <ClientTextTranslator />

        <header
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(2,8,23,0.92)",
            backdropFilter: "blur(14px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <nav
            aria-label="Navigare principală"
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: "14px 16px",
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.82)",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <a href="/" style={{ color: "white", textDecoration: "none" }}>Calculator</a>
            <a href="/calculator-salariu-2026" style={{ color: "inherit", textDecoration: "none" }}>Salary guide 2026</a>
            <a href="/calculator-brut-net" style={{ color: "inherit", textDecoration: "none" }}>Gross / net</a>
            <a href="/spor-de-noapte" style={{ color: "inherit", textDecoration: "none" }}>Night bonus</a>
            <a href="/concediu-medical" style={{ color: "inherit", textDecoration: "none" }}>Medical leave</a>
            <a href="/sarbatori-legale-2026" style={{ color: "inherit", textDecoration: "none" }}>Legal holidays</a>
            <a href="/contact" style={{ color: "inherit", textDecoration: "none" }}>Contact</a>
          </nav>
        </header>

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
          <div style={{ fontWeight: 700, fontSize: 18, color: "white" }}>
            Salary Calculator
          </div>

          <div style={{ marginTop: 6, marginBottom: 18, color: "rgba(255,255,255,0.45)" }}>
            v1.0 • © 2026
          </div>

          <a
            href="/privacy"
            style={{
              color: "inherit",
              marginRight: 16,
              textDecoration: "none",
            }}
          >
            Privacy
          </a>

          <a
            href="/terms"
            style={{
              color: "inherit",
              marginRight: 16,
              textDecoration: "none",
            }}
          >
            Terms
          </a>

          <a
            href="/contact"
            style={{
              color: "inherit",
              marginRight: 16,
              textDecoration: "none",
            }}
          >
            Contact
          </a>

          <a
            href="/delete-account"
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Delete account
          </a>

          <div style={{ marginTop: 20 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                padding: "10px 18px",
                border: "1px solid rgba(16,185,129,0.28)",
                background: "rgba(16,185,129,0.12)",
                color: "#6ee7b7",
                fontWeight: 800,
              }}
            >
              System online
            </span>
          </div>
        </footer>

      </body>
    </html>
  );
}


{/* Added informational pages for AdSense trust */}
