import React from "react";
import prisma from "@/lib/prisma";
import { CategoryCatalog } from "@/components/catalog/CategoryCatalog";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 300; // 5 minutes - real-time updates

// ✅ Dynamic metadata per category
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const label =
    slug === "sale"
      ? "Sale"
      : slug === "new-arrivals"
      ? "New Arrivals"
      : slug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

  return {
    title: `${label} | NEXUS`,
    description: `Browse our ${label} collection — premium smartphones and accessories.`,
  };
}

// ✅ Pre-generate known static category slugs at build time
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  return [
    { slug: "sale" },
    { slug: "new-arrivals" },
    ...categories.map((c) => ({ slug: c.slug })),
  ];
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ✅ Validate slug early
  if (!slug || slug.length > 100 || /[^a-z0-9-]/.test(slug)) {
    notFound();
  }

  const isSpecialSlug = slug === "sale" || slug === "new-arrivals";

  // ✅ Verify category exists for non-special slugs
  // ✅ Attempt to find as Category or FeaturedGroup
  const [category, featuredGroup] = await Promise.all([
    prisma.category.findFirst({
      where: { slug: { equals: slug, mode: "insensitive" } },
      include: { children: { select: { id: true } } }
    }),
    prisma.featuredGroup.findFirst({
      where: { slug: { equals: slug, mode: "insensitive" } },
      include: { categories: { select: { id: true } } }
    })
  ]);

  const targetEntity = category || featuredGroup;

  if (!isSpecialSlug && !targetEntity) {
    notFound();
  }

  // ✅ Clean where clause
  const whereClause: any =
    slug === "sale"
      ? { discount: { gt: 0 } }
      : slug === "new-arrivals"
      ? { isNew: true }
      : featuredGroup
      ? {
          OR: [
            { categoryId: { in: featuredGroup.categories.map((c) => c.id) } },
            { category: { parentId: { in: featuredGroup.categories.map((c) => c.id) } } },
          ],
        }
      : {
          OR: [
            { category: { slug: { equals: slug, mode: "insensitive" } } },
            { category: { parent: { slug: { equals: slug, mode: "insensitive" } } } },
          ],
        };

  const products = await prisma.product.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      slug: true,
      subCategory: true,
      categoryId: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      stock: true,
      sizes: true,
      colors: true,
      isNew: true,
      isBestSeller: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // ✅ Human-readable label
  const categoryLabel =
    slug === "sale"
      ? "Sale"
      : slug === "new-arrivals"
      ? "New Arrivals"
      : slug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

  const eyebrowLabel =
    slug === "sale"
      ? "Limited Time"
      : slug === "new-arrivals"
      ? "Just Dropped"
      : "Collection";

  const productCountLabel =
    products.length === 0
      ? "No products"
      : products.length === 1
      ? "1 product"
      : `${products.length} products`;

  return (
    <div className="min-h-screen bg-white pt-8 md:pt-0">

      {/* ── Page Header ── */}
      <div className="w-full border-b border-zinc-100 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-zinc-400 mb-4">
            <a
              href="/"
              className="hover:text-zinc-600 transition-colors duration-150"
            >
              Home
            </a>
            <span>/</span>
            <span className="text-zinc-600 font-medium">{categoryLabel}</span>
          </nav>

          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: "#dc2626" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#dc2626" }}>
                  {eyebrowLabel}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight">
                {categoryLabel}
              </h1>
            </div>

            {/* Product count pill */}
            <div className="flex items-center gap-2 sm:pb-1">
              <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
                {productCountLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Catalog or Empty State ── */}
      {products.length === 0 ? (
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center space-y-4">

            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-2">
              <svg
                className="w-7 h-7 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"
                />
              </svg>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-zinc-800">
                No products found
              </h2>
              <p className="text-sm text-zinc-500 max-w-xs">
                We couldn&apos;t find any products in{" "}
                <span className="font-semibold text-zinc-700">
                  {categoryLabel}
                </span>{" "}
                right now. Check back soon.
              </p>
            </div>

            {/* CTA — using cn() to avoid Turbopack > parsing issue */}
            <a
              href="/"
              className={cn(
                "mt-2 inline-flex items-center gap-2",
                "text-xs font-bold uppercase tracking-wider text-white",
                "bg-zinc-900 hover:bg-red-600 px-5 py-2.5 rounded-xl",
                "transition-colors duration-200"
              )}
            >
              Back to Home
            </a>
          </div>
        </div>
      ) : (
        <CategoryCatalog
          initialProducts={products as any}
          slug={slug}
        />
      )}
    </div>
  );
}