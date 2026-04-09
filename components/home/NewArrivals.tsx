import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/shared/ProductCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";

async function getNewArrivals() {
  return await prisma.product.findMany({
    where: { 
      isNew: true,
      stock: { gt: 0 } // Only show products with stock > 0
    },
    take: 8,
    orderBy: { createdAt: 'desc' }
  });
}

export async function NewArrivals() {
  const featuredProducts = await getNewArrivals();

  if (featuredProducts.length === 0) return null;

  return (
    <section id="new-arrivals" className="py-16 md:py-20 container mx-auto">
      <div className="px-4 md:px-6 lg:px-8 mb-10">
        <SectionHeading 
          title="New Arrivals" 
          subtitle="Discover our latest designs and exclusive collections."
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 px-4 md:px-6 lg:px-8">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product as any} />
        ))}
      </div>
    </section>
  );
}
