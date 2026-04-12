import React from "react";
import prisma from "@/lib/prisma";
import { SearchCatalog } from "@/components/catalog/SearchCatalog";

// ✅ Static regeneration - cache search results for 30 minutes
export const revalidate = 300; // 5 minutes - real-time updates

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  // Search products by name or description
  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {},
    select: {
      id: true,
      name: true,
      slug: true,
      subCategory: true,
      categoryId: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      stock: true,
      sizes: true,
      colors: true,
      isNew: true,
      isBestSeller: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-white transition-opacity duration-300">
      <SearchCatalog
        initialProducts={products as any}
        initialQuery={q}
      />
    </div>
  );
}
