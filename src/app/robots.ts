import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clickday.kr";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/settings/",
        "/blocked/",
        "/login/",
        "/auth/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
