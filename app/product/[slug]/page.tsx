import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Package,
  BadgeCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductSelection } from "@/components/catalog/ProductSelection";

async function getProduct(slug: string) {
  return await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const discountPercentage =
    product.discount > 0
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0;

  return (
    <div className="bg-white min-h-screen">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-zinc-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <nav className="flex items-center gap-1.5 py-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-none">
            <a
              href="/"
              className="hover:text-zinc-800 transition-colors duration-200 shrink-0"
            >
              Home
            </a>
            <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300" />
            <a
              href={`/category/${product.category.slug}`}
              className="hover:text-zinc-800 transition-colors duration-200 shrink-0"
            >
              {product.category.name}
            </a>
            <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300" />
            <span className="text-zinc-700 truncate max-w-[160px] sm:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24">

          {/* ─── Left · Visual Showcase ─── */}
          <div className="lg:col-span-7">
            <ProductGallery
              mainImage={product.image}
              supplementalImages={(product as any).images || []}
              productName={product.name}
              isNew={product.isNew}
              isBestSeller={product.isBestSeller}
            />
          </div>

          <div className="lg:col-span-5 lg:pt-2">
            <div className="lg:sticky lg:top-32 space-y-9">

              {/* Product Identity */}
              <div className="space-y-4">
                {/* Category */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className="rounded-full border-zinc-200 text-zinc-500 font-semibold text-[10px] uppercase tracking-widest px-3 py-1 bg-zinc-50"
                  >
                    {product.subCategory || product.category.name}
                  </Badge>
                </div>

                {/* Product Name */}
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 leading-[1.15]">
                  {product.name}
                </h1>

                {/* Short description if available */}
                {product.description && (
                  <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2" title={product.description}>
                    {product.description}
                  </p>
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-1.5">
                <div className="flex items-baseline flex-wrap gap-3">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-lg text-zinc-400 line-through font-medium">
                        ₹{product.originalPrice.toLocaleString("en-IN")}
                      </span>
                      <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[11px] font-bold rounded-full">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest">
                  Inclusive of all taxes · Free shipping on orders above ₹499
                </p>
              </div>

              <Separator className="bg-zinc-100" />

              {/* Selection Layer (Client) */}
              <ProductSelection product={product as any} />

              {/* Elite Trust Indicators */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  {
                    icon: ShieldCheck,
                    label: "100% Genuine",
                    sub: "Verified",
                  },
                  {
                    icon: Truck,
                    label: "Fast Delivery",
                    sub: "2–4 Days",
                  },
                  {
                    icon: RotateCcw,
                    label: "Easy Returns",
                    sub: "7-Day Policy",
                  },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center gap-1.5 p-3 rounded-2xl bg-zinc-50/50 border border-zinc-100/50 hover:bg-zinc-50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-zinc-900 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black text-zinc-950 uppercase tracking-tighter leading-none">
                        {label}
                      </p>
                      <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-tighter mt-1">
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Info Strip */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                <Package className="w-4 h-4 text-zinc-500 shrink-0" />
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Order within{" "}
                  <span className="text-zinc-800 font-semibold">
                    4 hrs 23 mins
                  </span>{" "}
                  to get it by{" "}
                  <span className="text-zinc-800 font-semibold">
                    Tomorrow, 10 AM
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Product Details Section ── */}
        <div className="mt-20 lg:mt-28">
          <Separator className="bg-zinc-100 mb-16" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

            {/* Description */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="block w-1 h-5 rounded-full bg-zinc-900" />
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
                    Product Description
                  </h2>
                </div>
                <p className="text-base text-zinc-500 leading-relaxed whitespace-pre-wrap">
                  {product.description ||
                    "Every creation is a masterpiece of modern design and premium craftsmanship. This item represents a commitment to excellence, blending comfort with a sophisticated aesthetic that transcends trends."}
                </p>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="block w-1 h-5 rounded-full bg-zinc-900" />
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
                      Key Highlights
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {product.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <BadgeCheck className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                        <span className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar Spec Card */}
            <div className="lg:col-span-5">
              <div className="rounded-[2rem] border border-zinc-100 bg-zinc-50/30 p-8 sm:p-10 space-y-8">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                    Technical Specs
                  </h3>
                  <div className="h-0.5 w-8 bg-zinc-200 rounded-full" />
                </div>
                
                <div className="space-y-0 divide-y divide-zinc-100/50">
                  {[
                    { label: "Collection", value: product.category.name },
                    product.subCategory && {
                      label: "Archetype",
                      value: product.subCategory,
                    },
                    {
                      label: "Availability",
                      value:
                        (product.sizes as string[])
                          ?.map((s) => s.split(":")[0])
                          .join(", ") || "One Size",
                    },
                    {
                      label: "Palette",
                      value:
                        product.colors.length > 0
                          ? `${product.colors.length} Variants`
                          : "Unified",
                    },
                    {
                      label: "Reference",
                      value: product.slug.toUpperCase().replace(/-/g, ""),
                    },
                    {
                      label: "Logistics",
                      value: "7-Day Return Sync",
                    },
                  ]
                    .filter(Boolean)
                    .map((spec: any) => (
                      <div
                        key={spec.label}
                        className="flex items-start justify-between gap-6 py-4"
                      >
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest shrink-0 pt-0.5">
                          {spec.label}
                        </span>
                        <span className="text-[11px] font-black text-zinc-900 text-right leading-relaxed">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}