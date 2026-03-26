import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getAdminBasePath } from "@/lib/admin-path";

export default function robots(): MetadataRoute.Robots {
  const base = env.APP_URL.replace(/\/+$/, "");
  const adminBasePath = getAdminBasePath();
  const disallow = ["/admin", "/account", "/api/", "/entrar", "/redefinir-senha"];
  if (adminBasePath !== "/admin") disallow.push(adminBasePath);
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
