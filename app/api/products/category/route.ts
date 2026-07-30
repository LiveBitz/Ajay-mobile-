import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getTotalStock, hasAvailableVariant } from "@/lib/inventory";

/**
 * GET /api/products/category
 *
 * Returns a paginated, server-filtered list of products for a category.
 * The CategoryCatalog client component calls this whenever the user changes
 * filters, sort order, or clicks "Load More" — so the browser never has to
 * download the full product catalogue upfront.
 *
 * Query params:
 *   slug          — category / featured-group slug or "sale" / "new-arrivals"
 *   page          — 1-based page number (default: 1)
 *   limit         — items per page, 8–48 (default: 24)
 *   sort          — relevance | price-asc | price-desc | discount | newest
 *   priceMin      — minimum price (default: 0)
 *   priceMax      — maximum price (default: unlimited)
 *   discount      — minimum discount % (default: 0)
 *   sizes         — comma-separated list e.g. "S,M,XL"
 *   colors        — comma-separated list e.g. "Black,White"
 *   subCategories — comma-separated list e.g. "iPhone,Samsung"
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const slug          = sp.get("slug") ?? "";
    const page          = Math.max(1, parseInt(sp.get("page")     ?? "1"));
    const limit         = Math.min(48, Math.max(8, parseInt(sp.get("limit") ?? "24")));
    const sort          = sp.get("sort") ?? "relevance";
    const priceMin      = parseFloat(sp.get("priceMin") ?? "0")      || 0;
    const priceMax      = parseFloat(sp.get("priceMax") ?? "999999") || 999_999;
    const discountMin   = parseInt(sp.get("discount")   ?? "0")      || 0;
    const sizes         = sp.get("sizes")?.split(",").filter(Boolean)         ?? [];
    const colors        = sp.get("colors")?.split(",").filter(Boolean)        ?? [];
    const subCategories = sp.get("subCategories")?.split(",").filter(Boolean) ?? [];

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    // ── Build the base WHERE clause from the slug ──────────────────────────────
    let baseWhere: Prisma.ProductWhereInput = {};

    if (slug === "sale") {
      baseWhere = { discount: { gt: 0 } };
    } else if (slug === "new-arrivals") {
      baseWhere = { isNew: true };
    } else {
      const [category, featuredGroup] = await Promise.all([
        prisma.category.findFirst({
          where: { slug: { equals: slug, mode: "insensitive" } },
        }),
        prisma.featuredGroup.findFirst({
          where: { slug: { equals: slug, mode: "insensitive" } },
          include: { categories: { select: { id: true } } },
        }),
      ]);

      if (!category && !featuredGroup) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }

      if (featuredGroup) {
        const catIds = featuredGroup.categories.map((c) => c.id);
        baseWhere = {
          OR: [
            { categoryId: { in: catIds } },
            { category: { parentId: { in: catIds } } },
          ],
        };
      } else {
        baseWhere = {
          OR: [
            { category: { slug: { equals: slug, mode: "insensitive" } } },
            { category: { parent: { slug: { equals: slug, mode: "insensitive" } } } },
          ],
        };
      }
    }

    // ── Apply user filters on top of the base clause ───────────────────────────
    const filterWhere: Prisma.ProductWhereInput = {
      ...baseWhere,
      price: { gte: priceMin, lte: priceMax },
      isArchived: false,
    };

    if (discountMin > 0) {
      filterWhere.discount = { gte: discountMin };
    }

    // SubCategory: exact match
    if (subCategories.length > 0) {
      filterWhere.subCategory = { in: subCategories };
    }

    // ── Sort order ─────────────────────────────────────────────────────────────
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price-asc"  ? { price: "asc" }      :
      sort === "price-desc" ? { price: "desc" }     :
      sort === "discount"   ? { discount: "desc" }  :
      sort === "newest"     ? { createdAt: "desc" } :
      /* relevance default */ { createdAt: "desc" };

    const skip = (page - 1) * limit;

    const productSelect = {
      id: true,
      name: true,
      slug: true,
      subCategory: true,
      categoryId: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      thumbnail: true,
      stock: true,
      sizes: true,
      colors: true,
      isNew: true,
      isBestSeller: true,
      category: { select: { name: true, slug: true } },
    } as const;

    const baseProducts = await prisma.product.findMany({
      where: filterWhere,
      select: productSelect,
      orderBy,
    });

    const filteredProducts = baseProducts.filter((product) => {
      const sizeEntries = Array.isArray(product.sizes) ? product.sizes : [];
      if (getTotalStock(sizeEntries) <= 0 && product.stock <= 0) return false;

      if (sizes.length === 0 && colors.length === 0) return true;

      if (sizes.length > 0 && colors.length > 0) {
        return sizes.some((size) =>
          colors.some((color) => hasAvailableVariant(sizeEntries, size, color))
        );
      }

      if (sizes.length > 0) {
        return sizes.some((size) => hasAvailableVariant(sizeEntries, size));
      }

      return colors.some((color) =>
        sizeEntries.some((entry) => {
          const dashIdx = entry.lastIndexOf("-");
          const colonIdx = entry.lastIndexOf(":");
          if (dashIdx === -1 || colonIdx === -1 || colonIdx <= dashIdx) return false;
          const qty = parseInt(entry.slice(colonIdx + 1), 10) || 0;
          const entryColor = entry.slice(dashIdx + 1, colonIdx);
          return qty > 0 && entryColor === color;
        })
      );
    });

    const total = filteredProducts.length;
    const products = filteredProducts.slice(skip, skip + limit);

    const response = NextResponse.json({ products, total, page, pageSize: limit });
    // Short cache: safe for CDN edge (filtered results change rarely)
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    console.error("Category products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
