import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://calculator-salariu-web.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/register", "/forgot-password", "/dashboard", "/profiles", "/company", "/history", "/settings", "/assistant", "/pricing/success"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
