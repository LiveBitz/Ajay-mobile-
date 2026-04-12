import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Package,
  BadgeCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductSelection } from "@/components/catalog/ProductSelection";

export const revalidate = 300; // 5 minutes - real-time updates

async function getProduct(slug: string) {
  return await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      subCategory: true,
      description: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      images: true,
      sizes: true,
      colors: true,
      isNew: true,
      isBestSeller: true,
      stock: true,
      features: true,
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

// ✅ Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | NEXUS`,
    description:
      product.description || `Buy ${product.name} at the best price.`,
    openGraph: { images: [product.image] },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const savings = product.originalPrice - product.price;
  const discountPct =
    product.discount > 0
      ? Math.round((savings / product.originalPrice) * 100)
      : 0;

  const sizeList = (
    Array.isArray(product.sizes) ? product.sizes : []
  ) as string[];
  const storageOptions =
    sizeList.map((s) => s.split(":")[0]).join(", ") || "Standard";

  const features = (
    Array.isArray(product.features) ? product.features : []
  ) as string[];
  const specFeatures = features.filter((f) => f.includes(":"));
  const bulletFeatures = features.filter((f) => !f.includes(":"));

  const trustBadges = [
    { icon: ShieldCheck, label: "100% Genuine", sub: "Verified Product" },
    { icon: Truck, label: "Fast Delivery", sub: "2–4 Business Days" },
    { icon: RotateCcw, label: "Easy Returns", sub: "7-Day Policy" },
  ];

  const specRows = [
    { label: "Brand", value: product.category.name },
    product.subCategory ? { label: "Type", value: product.subCategory } : null,
    { label: "Storage", value: storageOptions },
    {
      label: "Colors",
      value:
        product.colors.length > 0
          ? `${product.colors.length} Variant${product.colors.length > 1 ? "s" : ""}`
          : "Standard",
    },
    {
      label: "Model ID",
      value: product.slug.toUpperCase().replace(/-/g, ""),
    },
    { label: "Return Policy", value: "7-Day Returns" },
    { label: "Warranty", value: "1 Year Manufacturer" },
    ...specFeatures.map((f) => {
      const idx = f.indexOf(":");
      return {
        label: f.slice(0, idx).trim(),
        value: f.slice(idx + 1).trim(),
      };
    }),
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="bg-white min-h-screen">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-zinc-100 sticky top-0 z-20 backdrop-blur-sm bg-white/90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <nav className="flex items-center gap-1.5 py-3.5 text-[11px] font-semibold text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-none">
            <a
              href="/"
              className={cn(
                "hover:text-zinc-700 transition-colors shrink-0"
              )}
            >
              Home
            </a>
            <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300" />
            <a
              href={`/category/${product.category.slug}`}
              className={cn(
                "hover:text-zinc-700 transition-colors shrink-0"
              )}
            >
              {product.category.name}
            </a>
            <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300" />
            <span className="text-zinc-600 font-bold truncate max-w-[200px] sm:max-w-sm">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Main Product Grid ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16">

          {/* ─── Left · Gallery ─── */}
          <div className="lg:col-span-7">
            <ProductGallery
              mainImage={product.image}
              supplementalImages={(product as any).images || []}
              productName={product.name}
              isNew={product.isNew}
              isBestSeller={product.isBestSeller}
            />
          </div>

          {/* ─── Right · Details ─── */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* ── Identity ── */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {product.subCategory || product.category.name}
                  </span>
                  {product.isBestSeller && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg">
                      🔥 Bestseller
                    </span>
                  )}
                  {product.isNew && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-lg">
                      ✦ New Arrival
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
                  {product.name}
                </h1>

                {product.description && (
                  <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>

              {/* ── Pricing ── */}
              <div className="bg-zinc-50 rounded-2xl p-4 space-y-2 border border-zinc-100">
                <div className="flex items-baseline flex-wrap gap-3">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 tabular-nums">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-lg text-zinc-400 line-through font-medium tabular-nums">
                        ₹{product.originalPrice.toLocaleString("en-IN")}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-xs font-black text-white px-2.5 py-1 rounded-lg shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                          boxShadow: "0 2px 8px rgba(220,38,38,0.35)",
                        }}
                      >
                        <Zap
                          size={10}
                          style={{ fill: "#fbbf24", stroke: "none" }}
                        />
                        {discountPct}% OFF
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  {savings > 0 && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                      You save ₹{savings.toLocaleString("en-IN")}
                    </span>
                  )}
                  <p className="text-[10px] text-zinc-400 font-medium">
                    Inclusive of all taxes
                  </p>
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="h-px bg-zinc-100" />

              {/* ── Product Selection (Client Component) ── */}
              <ProductSelection product={product as any} />

              {/* ── Delivery Strip ── */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/50">
                <Package className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Order within{" "}
                  <span className="text-zinc-800 font-bold">4 hrs 23 mins</span>{" "}
                  to get it by{" "}
                  <span className="text-zinc-800 font-bold">
                    Tomorrow, 10 AM
                  </span>{" "}
                  · Free shipping above ₹499
                </p>
              </div>

              {/* ── Trust Badges ── */}
              <div className="grid grid-cols-3 gap-2.5">
                {trustBadges.map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-zinc-700" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-900 uppercase tracking-tight leading-tight">
                        {label}
                      </p>
                      <p className="text-[8px] text-zinc-400 font-medium mt-0.5 leading-tight">
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Details Section ── */}
        <div className="mt-16 md:mt-24 pt-12 border-t border-zinc-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

            {/* ─── Description + Features ─── */}
            <div className="lg:col-span-7 space-y-10">

              {/* Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-5 rounded-full bg-zinc-900" />
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                    About this Product
                  </h2>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-wrap">
                  {product.description ||
                    "A premium device built with exceptional craftsmanship, combining performance with elegant design. This product represents the pinnacle of modern engineering."}
                </p>
              </div>

              {/* Key Highlights */}
              {bulletFeatures.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1 h-5 rounded-full bg-zinc-900" />
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                      Key Highlights
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {bulletFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 group">
                        <div className="w-5 h-5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-colors duration-200">
                          <BadgeCheck className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors duration-200" />
                        </div>
                        <span className="text-sm text-zinc-600 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* In the Box */}
              <div className="p-5 rounded-2xl border border-zinc-100 bg-zinc-50/50 space-y-3">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                  In the Box
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Device",
                    "Charger",
                    "USB Cable",
                    "User Manual",
                    "Warranty Card",
                  ].map((item) => (
                    <span
                      key={item}
                      className="text-[10px] font-semibold text-zinc-600 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Spec Card ─── */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/80 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-zinc-900" />
                  <h3 className="text-xs font-black text-zinc-700 uppercase tracking-widest">
                    Technical Specifications
                  </h3>
                </div>

                {/* Rows */}
                <div className="divide-y divide-zinc-50">
                  {specRows.map((spec, idx) => (
                    <div
                      key={`${spec.label}-${idx}`}
                      className="flex items-start justify-between gap-4 px-6 py-3.5 hover:bg-zinc-50/60 transition-colors group"
                    >
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 pt-0.5 group-hover:text-zinc-600 transition-colors">
                        {spec.label}
                      </span>
                      <span className="text-xs font-bold text-zinc-900 text-right leading-relaxed">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
                  <p className="text-[10px] text-zinc-400 text-center font-medium">
                    Specifications may vary by region or retailer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}