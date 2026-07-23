import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: "https://hub.ranobe.vn",
      lastModified: now,
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://hub.ranobe.vn/resources",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://hub.ranobe.vn/aozora",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
