import { profile } from "@/content/profile";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${profile.websiteUrl}/sitemap.xml`,
  };
}
