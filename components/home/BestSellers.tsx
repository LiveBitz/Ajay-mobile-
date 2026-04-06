import React from "react";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/shared/ProductCard";
import { SectionHeading } from "@/components/shared/SectionHeading";

export function BestSellers() {
  // Show 8 products for Best Sellers
  const bestsellerProducts = [...products].reverse().slice(0, 8);

  return (
    <section id="best-sellers" className="py-20 container mx-auto">
      <div className="px-4 md:px-8 lg:px-16 mb-8">
        <SectionHeading 
          title="Best Sellers" 
          subtitle="The most loved pieces by our community. Grab yours before they are gone." 
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10 px-4 md:px-8 lg:px-16">
        {bestsellerProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
