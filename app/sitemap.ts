import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://calculator-salariu-web.vercel.app";
  const routes = [
    "", "/calculator-universal", "/calculator-brut-net", "/calculator-salariu-2026",
    "/program-in-ture", "/spor-de-noapte", "/spor-weekend", "/ore-suplimentare",
    "/concediu-medical", "/bonuri-de-masa", "/sarbatori-legale-2026",
    "/pricing", "/about", "/faq", "/contact", "/privacy", "/terms", "/cookies",
    "/retention", "/ai-policy", "/trust", "/security", "/subprocessors", "/dpa",
  ];
  return routes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date(), changeFrequency: route === "" ? "weekly" : "monthly", priority: route === "" ? 1 : route.includes("calculator") ? 0.9 : 0.6 }));
}
