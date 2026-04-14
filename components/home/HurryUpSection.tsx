import React from "react";
import prisma from "@/lib/prisma";
import { HurryUpCarousel } from "./HurryUpCarousel";

async function getBestSellerProducts() {
  const products = await prisma.product.findMany({
    where: {
      isBestSeller: true,
      stock: { gt: 0 },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return products;
}

export async function HurryUpSection() {
  const products = await getBestSellerProducts();

  if (products.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Layered background for depth */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Red top-left glow */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
          style={{ backgroundColor: 'rgba(220,38,38,0.12)' }}
        />
        {/* Subtle red bottom-right glow */}
        <div
          className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
          style={{ backgroundColor: 'rgba(153,27,27,0.1)' }}
        />
        {/* Thin top border in brand red */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />
      </div>

      <div className="mx-auto w-full max-w-[1720px] px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-10 md:py-14 lg:py-16 relative z-10">
        <HurryUpCarousel products={products} />
      </div>
    </section>
  );
}
