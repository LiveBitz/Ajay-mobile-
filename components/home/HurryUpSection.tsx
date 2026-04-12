import React from "react";
import prisma from "@/lib/prisma";
import { HurryUpCarousel } from "./HurryUpCarousel";

async function getBestSellerProducts() {
  const products = await prisma.product.findMany({
    where: {
      isBestSeller: true,
      stock: { gt: 0 },
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  return products;
}

export async function HurryUpSection() {
  const products = await getBestSellerProducts();

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-stone-950 via-stone-900 to-black relative overflow-hidden">
      {/* Animated Background Gradient Circles */}
      <div className="absolute inset-0 opacity-30">
        {/* Top Right Circle */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-b from-brand to-red-600 rounded-full mix-blend-multiply blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Bottom Left Circle */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-t from-red-700 to-orange-600 rounded-full mix-blend-multiply blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        
        {/* Center Bottom Circle */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-t from-brand/40 to-transparent rounded-full mix-blend-screen blur-3xl" style={{ animationDuration: '6s' }} />
      </div>

      {/* Grid Pattern Overlay (subtle) */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-b from-white/10 to-transparent" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
        backgroundSize: '50px 50px'
      }} />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Main Carousel Component */}
        <HurryUpCarousel products={products} />
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
    </section>
  );
}
