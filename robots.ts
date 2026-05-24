import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://calculator-salariu-web.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/calculator-salariu-2026", "/calculator-brut-net", "/spor-de-noapte", "/concediu-medical", "/sarbatori-legale-2026", "/privacy", "/terms", "/contact", "/delete-account"],
      disallow: ["/api/", "/login", "/register", "/history", "/premium", "/security"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
