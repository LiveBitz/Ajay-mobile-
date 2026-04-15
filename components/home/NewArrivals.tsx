import React from "react";
import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/shared/ProductCard";
import { getTotalStock } from "@/lib/inventory";

async function getNewArrivals() {
  const products = await prisma.product.findMany({
    where: { isNew: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return products
    .filter((p) => getTotalStock(p.sizes) > 0)
    .slice(0, 10);
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
        <div className="mb-5 md:mb-7 lg:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-900 tracking-tight leading-tight">
            Latest Launches
          </h2>
          <p className="text-[11px] md:text-xs text-zinc-400 font-medium mt-1">
            Newest smartphone releases with cutting-edge technology
          </p>
        </div>

        {/* Grid */}
        <div className="new-arrivals-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </div>

      <style>{`
        .new-arrivals-grid {
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(2, 1fr);
        }

        /* 3 cols — small tablets */
        @media (min-width: 560px) {
          .new-arrivals-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
        }

        /* 4 cols — md */
        @media (min-width: 768px) {
          .new-arrivals-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
          }
        }

        /* 5 cols — lg */
        @media (min-width: 1024px) {
          .new-arrivals-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 16px;
          }
        }

        /* 6 cols — xl */
        @media (min-width: 1280px) {
          .new-arrivals-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 18px;
          }
        }

        /* 7 cols — 2xl+ */
        @media (min-width: 1536px) {
          .new-arrivals-grid {
            grid-template-columns: repeat(7, 1fr);
            gap: 20px;
          }
        }
      `}</style>
    </section>
  );
}