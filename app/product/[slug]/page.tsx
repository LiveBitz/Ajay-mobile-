import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

async function getProduct(slug: string) {
  return await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true
    }
  });
}

export default async function ProductDetailsPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const discountPercentage = product.discount > 0 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Breadcrumb Section (Storefront Style) */}
      <div className="container mx-auto px-4 md:px-8 pt-8 lg:pt-12">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <a href="/" className="hover:text-brand transition-colors">Home</a>
          <span>/</span>
          <a href={`/category/${product.category.slug}`} className="hover:text-brand transition-colors">{product.category.name}</a>
          <span>/</span>
          <span className="text-zinc-900">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-8 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Visual Excellence Column (Left) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-[3/4] relative overflow-hidden rounded-[40px] bg-zinc-50 border border-zinc-100 shadow-2xl shadow-zinc-100/50 group">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                priority
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Floating Badges */}
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                {product.isNew && (
                  <Badge className="bg-zinc-950 text-white hover:bg-zinc-950 px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] shadow-2xl shadow-black/30">
                    NEW ARRIVAL
                  </Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-brand text-white hover:bg-brand px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] shadow-2xl shadow-brand/30">
                    BEST SELLER
                  </Badge>
                )}
              </div>

              {/* Focus Interaction */}
              <button className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/80 backdrop-blur-xl flex items-center justify-center text-zinc-600 shadow-xl hover:bg-white transition-all active:scale-90 border border-white/50">
                <Heart className="w-6 h-6 stroke-brand" />
              </button>
            </div>
          </div>

          {/* Details & Commercial Orchestration (Right) */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <div className="space-y-8 sticky top-[120px]">
              {/* Product Identity */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-brand/20 text-brand font-bold text-[10px] uppercase tracking-widest px-3 py-1 bg-brand/5">
                    {product.subCategory || product.category.name}
                  </Badge>
                  <div className="flex items-center gap-1 text-zinc-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-zinc-200 stroke-zinc-200" />
                    ))}
                    <span className="text-[10px] font-bold ml-1 tracking-tight">4.9 (120 Reviews)</span>
                  </div>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold font-heading tracking-tight text-zinc-950 leading-[1.1]">
                  {product.name}
                </h1>
              </div>

              {/* Pricing Architecture */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold font-heading tracking-tighter text-zinc-950">₹{product.price}</span>
                  {product.discount > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-zinc-400 line-through decoration-zinc-300 font-medium">₹{product.originalPrice}</span>
                      <Badge className="bg-success/10 text-success hover:bg-success/10 border-none px-3 py-1 text-[10px] font-bold rounded-full">
                        {discountPercentage}% OFF
                      </Badge>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Inclusive of all taxes</p>
              </div>

              <Separator className="bg-zinc-50" />

              {/* Variant selection (Dynamic from Database) */}
              <div className="space-y-10">
                {product.sizes.length > 0 && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Select Size</label>
                      <button className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline px-1">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((size: string) => (
                        <button 
                          key={size}
                          className="min-w-[4rem] h-14 rounded-2xl border border-zinc-100 flex items-center justify-center font-bold text-sm text-zinc-900 transition-all hover:border-brand hover:text-brand hover:bg-brand/5 active:scale-95 shadow-sm"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors.length > 0 && (
                  <div className="space-y-5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Available Colors</label>
                    <div className="flex flex-wrap gap-4">
                      {product.colors.map((color: string) => (
                        <button 
                          key={color}
                          title={color}
                          className="w-10 h-10 rounded-full border-2 border-white ring-1 ring-zinc-100 shadow-xl transition-all hover:scale-125 hover:ring-brand active:scale-95"
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Orchestration */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="flex-1 h-16 rounded-[2rem] bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-lg shadow-xl shadow-zinc-200 transition-all active:scale-[0.98] gap-3">
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="h-16 w-full sm:w-20 rounded-[2rem] border-zinc-100 shadow-sm hover:border-brand hover:text-brand transition-all active:scale-[0.98] flex items-center justify-center p-0">
                  <Heart className="w-6 h-6" />
                </Button>
              </div>

              {/* Brand Trust Framework */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-zinc-50 space-y-3">
                  <ShieldCheck className="w-6 h-6 text-zinc-900" />
                  <p className="text-[10px] font-bold text-zinc-950 uppercase tracking-tight">100% Genuine</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-zinc-50 space-y-3">
                  <Truck className="w-6 h-6 text-zinc-900" />
                  <p className="text-[10px] font-bold text-zinc-950 uppercase tracking-tight">FAST DELIVERY</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-zinc-50 space-y-3">
                  <RotateCcw className="w-6 h-6 text-zinc-900" />
                  <p className="text-[10px] font-bold text-zinc-950 uppercase tracking-tight">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Specifications Section */}
        <div className="mt-24 lg:mt-32 border-t border-zinc-50 pt-24 max-w-4xl">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-heading tracking-tight text-zinc-950">Product Story</h2>
              <div className="prose prose-zinc max-w-none">
                <p className="text-lg text-zinc-500 font-medium leading-relaxed whitespace-pre-wrap">
                  {product.description || "Every SOULED creation is a masterpiece of modern design and premium craftsmanship. This item represents our commitment to excellence, blending comfort with a sophisticated aesthetic that transcends trends."}
                </p>
              </div>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="space-y-8">
                <h3 className="text-[10px] font-bold text-brand uppercase tracking-widest">Key Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {product.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-brand">{idx + 1}</span>
                      </div>
                      <p className="text-zinc-600 font-medium leading-relaxed">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
