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
    <div className="min-h-screen bg-white transition-opacity duration-300 pt-8 md:pt-0">
      {/* Section header */}
      <div className="border-b border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">
            Results
          </p>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            {q ? (
              <>
                Search Results for{" "}
                <span style={{ color: '#dc2626' }}>&ldquo;{q}&rdquo;</span>
              </>
            ) : (
              "All Products"
            )}
          </h1>
          {products.length > 0 && (
            <p className="text-sm text-zinc-500 mt-1">
              {products.length} {products.length === 1 ? "product" : "products"} found
            </p>
          )}
        </div>
      </div>
      <SearchCatalog
        initialProducts={products as any}
        initialQuery={q}
      />
    </div>
  );
}
