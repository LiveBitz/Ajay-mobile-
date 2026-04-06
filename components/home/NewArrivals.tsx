import React from "react";
import Link from "next/link";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/shared/ProductCard";
import { SectionHeading } from "@/components/shared/SectionHeading";

export function NewArrivals() {
  // Show first 8 products for New Arrivals
  const featuredProducts = products.slice(0, 8);

  return (
    <section id="new-arrivals" className="py-14 container mx-auto">
      <div className="px-4 md:px-8 lg:px-16 mb-8">
        <SectionHeading 
          title="New Arrivals" 
          subtitle="Be the first to wear our latest designs and exclusive drops."
          trailing={
            <Link 
              href="/new-arrivals" 
              className="text-brand hover:underline font-bold text-sm tracking-tight flex items-center gap-1 group"
            >
              View All 
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          }
        />
      </div>
      
      {/* Horizontal Scroll on Mobile, Grid on Desktop */}
      <div className="relative">
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto md:overflow-x-visible pb-8 gap-4 md:gap-6 no-scrollbar px-4 md:px-8 lg:px-16 snap-x snap-mandatory scroll-smooth">
          {featuredProducts.map((product) => (
            <div 
              key={product.id} 
              className="min-w-[280px] md:min-w-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        {/* Subtle scroll indicators for mobile */}
        <div className="md:hidden flex justify-center gap-1 mt-2">
          {featuredProducts.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "h-1 w-4 rounded-full transition-all",
                idx === 0 ? "bg-brand w-8" : "bg-zinc-200"
              )} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Helper function locally if not available
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
