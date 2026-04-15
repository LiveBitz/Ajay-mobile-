import React from "react";
import prisma from "@/lib/prisma";
import { getTotalStock } from "@/lib/inventory";
import { ProductCard } from "@/components/shared/ProductCard";
import { NewArrivalsCarousel } from "./NewArrivalsCarousel";

async function getNewArrivals() {
  const products = await prisma.product.findMany({
    where: { isNew: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return products.filter((p) => getTotalStock(p.sizes) > 0).slice(0, 10);
}

export async function NewArrivals() {
  const featuredProducts = await getNewArrivals();
  if (featuredProducts.length === 0) return null;

  return (
    <section id="new-arrivals" className="py-6 md:py-10 lg:py-14 bg-white">
      <div className="mx-auto w-full max-w-[1720px] px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-0.5 rounded-full bg-red-600" />
          <p className="text-[11px] md:text-xs uppercase tracking-[0.16em] font-bold text-zinc-400">
            Fresh In
          </p>
        </div>
        <div className="mb-3 md:mb-7 lg:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-900 tracking-tight leading-tight">
            Latest Launches
          </h2>
          <p className="text-[11px] md:text-xs text-zinc-400 font-medium mt-1">
            Newest smartphone releases with cutting-edge technology
          </p>
        </div>

        {/* MOBILE: 3D carousel — bleeds edge to edge */}
        <div className="md:hidden -mx-4">
          <NewArrivalsCarousel products={featuredProducts} />
        </div>

        {/* DESKTOP: auto-fill grid */}
        <div className="hidden md:grid new-arrivals-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>

      <style>{`
        .new-arrivals-grid {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 14px;
        }
        @media (min-width: 1024px) {
          .new-arrivals-grid {
            grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
            gap: 16px;
          }
        }
        @media (min-width: 1280px) {
          .new-arrivals-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 18px;
          }
        }
        @media (min-width: 1536px) {
          .new-arrivals-grid {
            grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
            gap: 20px;
          }
        }
      `}</style>
    </section>
  );
}