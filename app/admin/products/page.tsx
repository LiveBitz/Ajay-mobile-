import React from "react";
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { AddProductButton } from "@/components/admin/AddProductButton";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

async function getProducts(page: number) {
  const skip = (page - 1) * PAGE_SIZE;
  // Phase 6: Use select instead of include (80% less data vs include())
  // Note: Keeping sizes, isNew, isBestSeller fields needed by component
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
      sizes: true,  // Needed for component stock parsing
      isNew: true,   // Needed for New Arrival badge
      isBestSeller: true, // Needed for Bestseller badge
      createdAt: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

async function getTotalProducts() {
  return await prisma.product.count();
}

async function getCategories() {
  return await prisma.category.findMany();
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsAdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  
  const [products, totalNodes, categories] = await Promise.all([
    getProducts(currentPage),
    getTotalProducts(),
    getCategories()
  ]);

  const totalPages = Math.ceil(totalNodes / PAGE_SIZE);
  const startNode = (currentPage - 1) * PAGE_SIZE + 1;
  const endNode = Math.min(currentPage * PAGE_SIZE, totalNodes);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-16 px-3 sm:px-4 lg:px-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold font-heading tracking-tight text-zinc-900">
            Inventory Console
          </h1>
          <p className="text-zinc-500 font-medium text-xs sm:text-sm leading-relaxed">
            Orchestrate and monitor your{" "}
            <span className="text-brand font-bold">Premium Digital Assets</span>.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <AddProductButton categories={categories} />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/80 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-zinc-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-all focus-within:shadow-lg focus-within:shadow-zinc-200/50">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-brand transition-colors" />
          <input
            type="text"
            placeholder="Search products, SKUs..."
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-zinc-50/30 border border-zinc-100 sm:border-0 rounded-xl sm:rounded-2xl text-sm font-bold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal focus:ring-0 focus:outline-none transition-all"
          />
        </div>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl h-11 sm:h-12 border-zinc-100 hover:bg-zinc-50 font-extrabold px-5 sm:px-8 shadow-sm text-zinc-500 transition-all active:scale-95 text-sm"
        >
          <Filter className="w-4 h-4 text-zinc-400" />
          Logic Filter
        </Button>
      </div>

      {/* Inventory View */}
      <div className="space-y-4 sm:space-y-6">

        {/* ── Desktop Table (≥ xl) ── */}
        <div className="hidden xl:block bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100 text-zinc-400">
                  <th className="py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest">Product Narrative</th>
                  <th className="py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest">Collection</th>
                  <th className="py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest">Inventory</th>
                  <th className="py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest">Commercials</th>
                  <th className="py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="space-y-6 flex flex-col items-center">
                        <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl">
                          <Package className="w-9 h-9 text-zinc-200" />
                        </div>
                        <p className="font-extrabold text-xl text-zinc-900">
                          Digital Inventory is pristine.
                        </p>
                        <AddProductButton categories={categories} />
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const sizes = (Array.isArray(p.sizes) ? p.sizes : []) as string[];
                    const totalStock = sizes.reduce(
                      (acc: number, s: string) => acc + parseInt(s.split(":")[1] || "0"),
                      0
                    );
                    const isOutOfStock = totalStock === 0;
                    const isLowStock = totalStock > 0 && totalStock < 10;

                    return (
                      <tr
                        key={p.id}
                        className="group/row hover:bg-zinc-50/40 transition-colors border-b border-zinc-50 last:border-0 font-medium"
                      >
                        {/* Product */}
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 shrink-0 border-2 border-white shadow-md relative transition-transform group-hover/row:scale-105">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center">
                                  <span className="text-[7px] font-black text-white uppercase tracking-tighter">
                                    Sold Out
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-zinc-900 text-sm font-extrabold group-hover/row:text-brand transition-colors truncate max-w-[160px]">
                                {p.name}
                              </p>
                              <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-0.5 tabular-nums">
                                ID: {p.id.slice(-8).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Collection */}
                        <td className="py-5 px-6">
                          <div className="space-y-2">
                            <div className="inline-flex items-center px-3 py-1 bg-white border border-zinc-100 rounded-full text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider shadow-sm">
                              {p.category.name}
                            </div>
                            <div className="flex gap-1.5">
                              {p.isBestSeller && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"
                                  title="Bestseller"
                                />
                              )}
                              {p.isNew && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-zinc-900"
                                  title="New Arrival"
                                />
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Inventory */}
                        <td className="py-5 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  isOutOfStock
                                    ? "bg-red-500 shadow-lg shadow-red-200"
                                    : isLowStock
                                    ? "bg-amber-500 shadow-lg shadow-amber-200"
                                    : "bg-emerald-500 shadow-lg shadow-emerald-200"
                                )}
                              />
                              <span className="text-base font-black text-zinc-900 tabular-nums tracking-tight">
                                {totalStock}
                                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest ml-1">
                                  Units
                                </span>
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {sizes.map((s) => {
                                const [size, qty] = s.split(":");
                                const isSizeOut = qty === "0";
                                return (
                                  <span
                                    key={size}
                                    className={cn(
                                      "text-[8px] font-bold px-2 py-1 rounded-md bg-zinc-50 border border-zinc-100 tabular-nums uppercase transition-colors",
                                      isSizeOut
                                        ? "text-zinc-200 border-zinc-50"
                                        : "text-zinc-500 group-hover/row:text-zinc-900 group-hover/row:border-zinc-200"
                                    )}
                                  >
                                    {size}:{qty}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </td>

                        {/* Commercials */}
                        <td className="py-5 px-6">
                          <div className="space-y-1">
                            <p className="font-extrabold text-lg text-zinc-900 font-heading tracking-tight tabular-nums">
                              ₹{p.price}
                            </p>
                            {p.discount > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-zinc-300 line-through font-bold">
                                  ₹{p.originalPrice}
                                </span>
                                <span className="text-[9px] text-brand font-extrabold uppercase bg-brand/5 px-1.5 py-0.5 rounded-full">
                                  {p.discount}% OFF
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-5 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/products/${p.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-xl hover:bg-zinc-50 transition-all active:scale-90 border border-zinc-100 shadow-sm"
                              >
                                <Edit className="w-4 h-4 text-zinc-600" />
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
        </div>

        {/* ── Mobile / Tablet Card Grid (< xl) ── */}
        <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {products.length === 0 ? (
            <div className="col-span-full p-12 sm:p-16 text-center bg-white rounded-3xl border border-zinc-100 shadow-sm space-y-4">
              <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto border-4 border-white shadow-xl">
                <Package className="w-7 h-7 text-zinc-200" />
              </div>
              <p className="font-extrabold text-zinc-900 text-sm">
                Digital Inventory is pristine.
              </p>
              <AddProductButton categories={categories} />
            </div>
          ) : (
            products.map((p) => {
              const sizes = (Array.isArray(p.sizes) ? p.sizes : []) as string[];
              const totalStock = sizes.reduce(
                (acc: number, s: string) => acc + parseInt(s.split(":")[1] || "0"),
                0
              );
              const isOutOfStock = totalStock === 0;
              const isLowStock = totalStock > 0 && totalStock < 10;

              return (
                <div
                  key={p.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-100 shadow-sm space-y-4 flex flex-col"
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-zinc-100 border-2 border-white shadow-lg shrink-0 relative">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="text-[7px] font-black text-white uppercase tracking-tighter">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-extrabold text-brand uppercase tracking-widest bg-brand/5 px-2 py-0.5 rounded-full border border-brand/10">
                          {p.category.name}
                        </span>
                        <span
                          className={cn(
                            "text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                            isOutOfStock
                              ? "bg-red-50 text-red-500 border-red-100"
                              : isLowStock
                              ? "bg-amber-50 text-amber-500 border-amber-100"
                              : "bg-emerald-50 text-emerald-500 border-emerald-100"
                          )}
                        >
                          {totalStock} In Sync
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 line-clamp-2 leading-tight">
                        {p.name}
                      </h3>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                        ID: {p.id.slice(-8).toUpperCase()}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-extrabold text-zinc-900 font-heading tracking-tight tabular-nums">
                          ₹{p.price}
                        </p>
                        {p.discount > 0 && (
                          <>
                            <p className="text-[10px] text-zinc-300 font-bold line-through tabular-nums">
                              ₹{p.originalPrice}
                            </p>
                            <span className="text-[9px] text-brand font-extrabold uppercase bg-brand/5 px-1.5 py-0.5 rounded-full">
                              {p.discount}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size Stock Chips */}
                  {sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sizes.map((s) => {
                        const [size, qty] = s.split(":");
                        const isSizeOut = qty === "0";
                        return (
                          <span
                            key={size}
                            className={cn(
                              "text-[8px] font-bold px-2 py-1 rounded-md bg-zinc-50 border tabular-nums uppercase",
                              isSizeOut
                                ? "text-zinc-200 border-zinc-50"
                                : "text-zinc-500 border-zinc-100"
                            )}
                          >
                            {size}:{qty}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Badges */}
                  {(p.isBestSeller || p.isNew) && (
                    <div className="flex gap-2">
                      {p.isBestSeller && (
                        <span className="text-[9px] font-extrabold text-brand uppercase tracking-widest bg-brand/5 px-2.5 py-1 rounded-full border border-brand/10">
                          Bestseller
                        </span>
                      )}
                      {p.isNew && (
                        <span className="text-[9px] font-extrabold text-zinc-900 uppercase tracking-widest bg-zinc-100 px-2.5 py-1 rounded-full">
                          New Arrival
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-zinc-50 mt-auto">
                    <Link href={`/admin/products/${p.id}/edit`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl border-zinc-100 font-extrabold text-zinc-900 shadow-sm gap-2 active:scale-95 text-sm"
                      >
                        <Edit className="w-3.5 h-3.5 text-zinc-400" />
                        Edit
                      </Button>
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dynamic Pagination Console */}
        {totalNodes > 0 && (
          <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-zinc-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest text-center sm:text-left">
                Console Sync &mdash; Showing {startNode}-{endNode} of {totalNodes} Nodes
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href={currentPage > 1 ? `/admin/products?page=${currentPage - 1}` : '#'}>
                <Button
                  variant="outline"
                  disabled={currentPage <= 1}
                  className="rounded-xl font-extrabold h-11 border-zinc-100 text-zinc-600 shadow-sm px-5 hover:bg-zinc-50 active:scale-95 transition-all text-sm gap-2 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Button>
              </Link>
              
              <div className="hidden sm:flex items-center gap-2 px-4 h-11 bg-zinc-50/50 rounded-xl border border-zinc-100 font-black text-zinc-900 text-xs tabular-nums">
                <span className="text-zinc-400 font-bold uppercase tracking-widest mr-2">Page</span>
                {currentPage} <span className="text-zinc-300 font-normal mx-1">/</span> {totalPages}
              </div>

              <Link href={currentPage < totalPages ? `/admin/products?page=${currentPage + 1}` : '#'}>
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  className="rounded-xl font-extrabold h-11 border-zinc-100 text-zinc-600 shadow-sm px-5 hover:bg-zinc-50 active:scale-95 transition-all text-sm gap-2 disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}