import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://calculator-salariu-web.vercel.app";

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/faq`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/delete-account`, lastModified: new Date() },
    { url: `${baseUrl}/calculator-brut-net`, lastModified: new Date() },
    { url: `${baseUrl}/spor-de-noapte`, lastModified: new Date() },
    { url: `${baseUrl}/concediu-medical`, lastModified: new Date() },
    { url: `${baseUrl}/sarbatori-legale-2026`, lastModified: new Date() },
    { url: `${baseUrl}/bonuri-de-masa`, lastModified: new Date() },
    { url: `${baseUrl}/spor-weekend`, lastModified: new Date() },
    { url: `${baseUrl}/ore-suplimentare`, lastModified: new Date() },
    { url: `${baseUrl}/program-in-ture`, lastModified: new Date() },
  ];
}
