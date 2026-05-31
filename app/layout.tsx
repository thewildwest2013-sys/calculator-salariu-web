import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionGuard from "@/components/SessionGuard";
import ClientTextTranslator from "@/components/ClientTextTranslator";


export const metadata: Metadata = {
  title: "Calculator Salariu 2026 - salariu net, ture și sporuri",
  description:
    "Calculator Salariu te ajută să estimezi salariul net, turele, sporul de noapte, weekendurile, sărbătorile legale și istoricul calculelor.",
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Calculator Salariu 2026",
    description:
      "Calculează salariul net, sporurile, turele și exportă istoricul calculelor.",
    url: "https://calculator-salariu-web.vercel.app",
    siteName: "Calculator Salariu",
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
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.82)",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            <a
              href="/"
              style={{
                color: "white",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 999,
                padding: "8px 16px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              Calculator / Home
            </a>
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
            Calculator Salariu
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
            Confidențialitate
          </a>

          <a
  href="/terms"
  style={{
    color: "inherit",
    marginRight: 16,
    textDecoration: "none",
  }}
>
  Termeni
</a>

<a
  href="/about"
  style={{
    color: "inherit",
    marginRight: 16,
    textDecoration: "none",
  }}
>
  Despre proiect
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
            Ștergere cont
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
              Sistem online
            </span>
          </div>
        </footer>

      </body>
    </html>
  );
}

