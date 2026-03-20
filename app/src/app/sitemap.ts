import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.APP_URL.replace(/\/+$/, "");
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/planos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/comprar-acesso`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/comprar-iptv`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/como-funciona-iptv`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/iptv-e-confiavel`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/termos`, lastModified: now, changeFrequency: "yearly", priority: 0.45 },
    { url: `${base}/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.45 },
    { url: `${base}/contato`, lastModified: now, changeFrequency: "monthly", priority: 0.55 },
  ];
}
