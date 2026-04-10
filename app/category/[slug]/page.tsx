import React from "react";
import prisma from "@/lib/prisma";
import { CategoryCatalog } from "@/components/catalog/CategoryCatalog";

// ✅ PHASE 2: Static regeneration - cache category pages for 1 hour
export const revalidate = 3600;

export default async function CategoryPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  // ✅ PHASE 1: Selective field queries - only fetch needed fields
  const products = await prisma.product.findMany({
    where: slug === "sale" 
      ? { discount: { gt: 0 } }
      : slug === "new-arrivals"
      ? { isNew: true }
      : { 
          category: {
             slug: {
                equals: slug,
                mode: "insensitive"
             }
          } 
        },
    select: {
      id: true,
      name: true,
      slug: true,
      subCategory: true,        // ← ADDED: Required for filtering
      categoryId: true,         // ← ADDED: Required for identification
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      stock: true,
      sizes: true,              // ← ADDED: Need for stock calculation
      colors: true,             // ← ADDED: Need for product display
      isNew: true,
      isBestSeller: true,
      category: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="min-h-screen bg-white transition-opacity duration-300">
      <CategoryCatalog initialProducts={products as any} slug={slug} />
    </div>
  );
}
