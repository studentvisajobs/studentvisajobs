import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://studentvisajobs.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/jobs/part-time`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sponsors`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/tools/cv-cover-letter`,
      lastModified: new Date(),
    },
  ];
}