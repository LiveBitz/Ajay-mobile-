import React from "react";
import {
  Package,
  Search,
  Filter,
  Edit,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { AddProductButton } from "@/components/admin/AddProductButton";
import { ProductQuickToggle } from "@/components/admin/ProductQuickToggle";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

async function getProducts(page: number) {
  const skip = (page - 1) * PAGE_SIZE;
  return await prisma.product.findMany({
    skip,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      stock: true,
      sizes: true,
      isNew: true,
      isBestSeller: true,
      createdAt: true,
      categoryId: true,
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getTotalProducts() {
  return await prisma.product.count();
}

async function getCategories() {
  return await prisma.category.findMany();
}

// ✅ Reusable stock parser
function parseStock(sizes: string[]) {
  const totalStock = sizes.reduce(
    (acc, s) => acc + parseInt(s.split(":")[1] || "0"),
    0
  );
  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock < 10;
  return { totalStock, isOutOfStock, isLowStock };
}

// ✅ Stock status badge
function StockBadge({
  isOutOfStock,
  isLowStock,
  totalStock,
}: {
  isOutOfStock: boolean;
  isLowStock: boolean;
  totalStock: number;
}) {
  if (isOutOfStock) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100">
        <XCircle className="w-3 h-3" />
        Out of Stock
      </span>
    );
  }
  if (isLowStock) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
        <AlertTriangle className="w-3 h-3" />
        Low — {totalStock} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
      <CheckCircle2 className="w-3 h-3" />
      {totalStock} in stock
    </span>
  );
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsAdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const [products, totalCount, categories] = await Promise.all([
    getProducts(currentPage),
    getTotalProducts(),
    getCategories(),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const startItem = (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);

  // ✅ Summary stats
  const allSizes = products.flatMap((p) =>
    Array.isArray(p.sizes) ? (p.sizes as string[]) : []
  );
  const outOfStockCount = products.filter((p) => {
    const sizes = Array.isArray(p.sizes) ? (p.sizes as string[]) : [];
    const { isOutOfStock } = parseStock(sizes);
    return isOutOfStock;
  }).length;
  const lowStockCount = products.filter((p) => {
    const sizes = Array.isArray(p.sizes) ? (p.sizes as string[]) : [];
    const { isLowStock } = parseStock(sizes);
    return isLowStock;
  }).length;

  return (
    <div className="space-y-5 sm:space-y-6 pb-16 px-3 sm:px-4 lg:px-0">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-0.5 bg-red-600 rounded-full" />
            <span className="text-red-600 text-[10px] font-bold uppercase tracking-[0.2em]">
              Inventory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-900">
            Product Management
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm">
            {totalCount} products across {categories.length} categories
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <AddProductButton />
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 space-y-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Total
          </p>
          <p className="text-2xl font-black text-zinc-900 tabular-nums">
            {totalCount}
          </p>
          <p className="text-[10px] text-zinc-400">Products</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 space-y-1">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
            Low Stock
          </p>
          <p className="text-2xl font-black text-amber-600 tabular-nums">
            {lowStockCount}
          </p>
          <p className="text-[10px] text-amber-400">Need restock</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4 space-y-1">
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
            Out of Stock
          </p>
          <p className="text-2xl font-black text-red-600 tabular-nums">
            {outOfStockCount}
          </p>
          <p className="text-[10px] text-red-400">Action needed</p>
        </div>
      </div>

      {/* ── Search & Filter ── */}
      <div className="bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-200 transition-all"
          />
        </div>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 rounded-xl h-10 border-zinc-200 hover:bg-zinc-50 font-semibold px-5 text-zinc-600 text-sm"
        >
          <Filter className="w-4 h-4 text-zinc-400" />
          Filter
        </Button>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden xl:block bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="py-4 px-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Product
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Category
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Stock
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Price
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const sizes = (
                  Array.isArray(p.sizes) ? p.sizes : []
                ) as string[];
                const { totalStock, isOutOfStock, isLowStock } =
                  parseStock(sizes);

                return (
                  <tr
                    key={p.id}
                    className="group/row hover:bg-zinc-50/60 transition-colors"
                  >
                    {/* Product */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-100 shadow-sm group-hover/row:shadow-md transition-shadow">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="text-[7px] font-black text-white uppercase">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate max-w-[180px] group-hover/row:text-red-600 transition-colors">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            #{p.id.slice(-8).toUpperCase()}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {p.isBestSeller && (
                              <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md">
                                🔥 Hot
                              </span>
                            )}
                            {p.isNew && (
                              <span className="text-[9px] font-bold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded-md">
                                ✦ New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {p.category.name}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-5">
                      <div className="space-y-2">
                        <StockBadge
                          isOutOfStock={isOutOfStock}
                          isLowStock={isLowStock}
                          totalStock={totalStock}
                        />
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {sizes.map((s) => {
                            const [size, qty] = s.split(":");
                            const isSizeOut = qty === "0";
                            return (
                              <span
                                key={size}
                                className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded-md tabular-nums uppercase border",
                                  isSizeOut
                                    ? "text-zinc-300 border-zinc-100 bg-zinc-50"
                                    : "text-zinc-600 border-zinc-200 bg-white"
                                )}
                              >
                                {size}:{qty}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <p className="font-black text-lg text-zinc-900 tabular-nums">
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                        {p.discount > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-zinc-400 line-through tabular-nums">
                              ₹{p.originalPrice.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md">
                              -{p.discount}%
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-2">
                        <ProductQuickToggle
                          productId={p.id}
                          productName={p.name}
                          initialIsBestSeller={p.isBestSeller}
                          initialIsNew={p.isNew}
                        />
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-9 h-9 rounded-xl hover:bg-zinc-100 border border-zinc-100 transition-all active:scale-90"
                          >
                            <Edit className="w-3.5 h-3.5 text-zinc-500" />
                          </Button>
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile / Tablet Card Grid ── */}
      <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <div className="col-span-full">
            <EmptyState />
          </div>
        ) : (
          products.map((p) => {
            const sizes = (
              Array.isArray(p.sizes) ? p.sizes : []
            ) as string[];
            const { totalStock, isOutOfStock, isLowStock } = parseStock(sizes);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col"
              >
                {/* Card Image Strip */}
                <div className="relative h-40 bg-zinc-50 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* Badges top-left */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {p.isBestSeller && (
                      <span className="text-[9px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-lg shadow-sm">
                        🔥 Hot
                      </span>
                    )}
                    {p.isNew && (
                      <span className="text-[9px] font-bold text-white bg-zinc-900 px-2 py-0.5 rounded-lg shadow-sm">
                        ✦ New
                      </span>
                    )}
                  </div>

                  {/* Stock badge top-right */}
                  <div className="absolute top-3 right-3">
                    <StockBadge
                      isOutOfStock={isOutOfStock}
                      isLowStock={isLowStock}
                      totalStock={totalStock}
                    />
                  </div>

                  {/* Name + price bottom overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-sm leading-tight line-clamp-1">
                      {p.name}
                    </p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-white font-black text-base tabular-nums">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>
                      {p.discount > 0 && (
                        <>
                          <span className="text-white/60 text-xs line-through tabular-nums">
                            ₹{p.originalPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[9px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-md">
                            -{p.discount}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  {/* Meta */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg uppercase tracking-wider">
                      {p.category.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      #{p.id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  {/* Size chips */}
                  {sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sizes.map((s) => {
                        const [size, qty] = s.split(":");
                        const isSizeOut = qty === "0";
                        return (
                          <span
                            key={size}
                            className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded-md tabular-nums uppercase border",
                              isSizeOut
                                ? "text-zinc-300 border-zinc-100 bg-zinc-50"
                                : "text-zinc-600 border-zinc-200 bg-white"
                            )}
                          >
                            {size}:{qty}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 mt-auto">
                    <ProductQuickToggle
                      productId={p.id}
                      productName={p.name}
                      initialIsBestSeller={p.isBestSeller}
                      initialIsNew={p.isNew}
                    />
                    <Link href={`/admin/products/${p.id}/edit`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full h-9 rounded-xl border-zinc-200 font-semibold text-zinc-700 gap-1.5 text-xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-semibold text-zinc-500">
              Showing{" "}
              <span className="text-zinc-900 font-black">
                {startItem}–{endItem}
              </span>{" "}
              of{" "}
              <span className="text-zinc-900 font-black">{totalCount}</span>{" "}
              products
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={
                currentPage > 1
                  ? `/admin/products?page=${currentPage - 1}`
                  : "#"
              }
            >
              <Button
                variant="outline"
                disabled={currentPage <= 1}
                className="h-9 px-4 rounded-xl border-zinc-200 text-zinc-600 font-semibold text-sm gap-1.5 disabled:opacity-30 hover:bg-zinc-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
            </Link>

            <div className="flex items-center px-4 h-9 bg-zinc-50 rounded-xl border border-zinc-100 text-xs font-bold text-zinc-700 tabular-nums">
              {currentPage} / {totalPages}
            </div>

            <Link
              href={
                currentPage < totalPages
                  ? `/admin/products?page=${currentPage + 1}`
                  : "#"
              }
            >
              <Button
                variant="outline"
                disabled={currentPage >= totalPages}
                className="h-9 px-4 rounded-xl border-zinc-200 text-zinc-600 font-semibold text-sm gap-1.5 disabled:opacity-30 hover:bg-zinc-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Reusable empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
      <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 shadow-sm">
        <Package className="w-7 h-7 text-zinc-300" />
      </div>
      <div className="space-y-1">
        <p className="font-bold text-zinc-800 text-sm">No products yet</p>
        <p className="text-zinc-400 text-xs">
          Add your first product to get started
        </p>
      </div>
      <AddProductButton />
    </div>
  );
}