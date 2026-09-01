import type { MetadataRoute } from "next";
import { clientConfig } from "@/config/client";

/**
 * Admin and client-dashboard paths are disallowed so they don't get crawled into
 * the index. This is discoverability hygiene, not a security control — the real
 * protection is middleware plus the role checks in `authz.ts`. Anyone can read
 * robots.txt, so it must never be the only thing standing in front of /admin.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/track", "/login", "/signup"],
    },
    sitemap: `${clientConfig.siteUrl}/sitemap.xml`,
    host: clientConfig.siteUrl,
  };
}
