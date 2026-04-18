import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const siteUrl = "https://www.priyamobilepark.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/category/smartphones`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/category/apple`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/category/samsung`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/category/accessories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/category/new-arrivals`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/category/sale`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
      where: { stock: { gt: 0 } },
    });
    productPages = products.map((p) => ({
      url: `${siteUrl}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Silently skip if DB unavailable at build time
  }

  // Dynamic category pages
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });
    categoryPages = categories.map((c) => ({
      url: `${siteUrl}/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Silently skip if DB unavailable at build time
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
