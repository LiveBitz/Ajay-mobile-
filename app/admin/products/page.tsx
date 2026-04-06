import React from "react";
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { AddProductButton } from "@/components/admin/AddProductButton";

async function getProducts() {
  return await prisma.product.findMany({
    include: {
      category: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

async function getCategories() {
  return await prisma.category.findMany();
}

export default async function ProductsAdminPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="space-y-6 sm:space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 overflow-hidden">
        <div className="space-y-1 sm:space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-zinc-900 px-1">
            Inventory
          </h1>
          <p className="text-zinc-500 font-medium text-sm sm:text-base leading-relaxed px-2">
            Curate and manage your <span className="text-brand font-bold">Premium Collections</span>.
          </p>
        </div>
        <AddProductButton categories={categories} />
      </div>

      {/* Filters Bar */}
      <div className="bg-white/80 p-4 rounded-[40px] border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center gap-4 transition-all">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search products, SKUs, or collections..." 
            className="w-full pl-14 pr-8 py-5 bg-zinc-50/50 border-0 rounded-[28px] text-sm font-bold text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-brand/10 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-3 rounded-[28px] h-[64px] border-zinc-100 hover:bg-zinc-50 font-extrabold px-10 shadow-sm text-zinc-600 transition-all">
            <Filter className="w-4 h-4 text-zinc-400" />
            Filter
          </Button>
        </div>
      </div>

      {/* Hybrid Inventory View */}
      <div className="space-y-6">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-[48px] border border-zinc-100 shadow-sm overflow-hidden group">
          <div className="overflow-x-auto no-scrollbar scroll-smooth">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="p-8 text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-10">Product Narrative</th>
                  <th className="p-8 text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-10">Collection</th>
                  <th className="p-8 text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-10">Commercials</th>
                  <th className="p-8 text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-32 text-center space-y-8">
                      <div className="w-24 h-24 bg-zinc-50 rounded-[40px] flex items-center justify-center mx-auto border-4 border-white shadow-xl">
                        <Package className="w-10 h-10 text-zinc-200" />
                      </div>
                      <p className="font-extrabold text-2xl text-zinc-900">Your inventory is pristine.</p>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="group/row hover:bg-zinc-50/40 transition-colors border-b border-zinc-50 last:border-0 font-medium h-32">
                      <td className="p-8 px-10">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-[32px] overflow-hidden bg-zinc-100 shrink-0 border-4 border-white shadow-lg relative transition-transform group-hover/row:scale-110">
                             <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-zinc-900 text-lg font-extrabold group-hover/row:text-brand transition-colors line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-zinc-400 font-extrabold uppercase mt-1 tabular-nums">ID: {p.id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8 px-10">
                         <div className="space-y-2">
                          <div className="inline-flex items-center px-4 py-1.5 bg-white border border-zinc-100 rounded-full text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider shadow-sm transition-all group-hover/row:border-brand/20">
                            {p.category.name}
                          </div>
                          <div className="flex gap-2">
                             {p.isBestSeller && <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" title="Bestseller" />}
                             {p.isNew && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" title="New Arrival" />}
                          </div>
                        </div>
                      </td>
                      <td className="p-8 px-10">
                        <div className="space-y-1">
                          <p className="font-extrabold text-xl text-zinc-900 font-heading tracking-tight tabular-nums">₹{p.price}</p>
                          {p.discount > 0 && (
                            <p className="text-[9px] text-brand font-extrabold uppercase bg-brand/5 px-2 py-0.5 rounded-full inline-block">{p.discount}% OFF</p>
                          )}
                        </div>
                      </td>
                      <td className="p-8 px-10">
                        <div className="flex items-center justify-end gap-3">
                           <Link href={`/admin/products/${p.id}/edit`}>
                              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl hover:bg-brand/5 hover:text-brand transition-all active:scale-90 border border-zinc-100 sm:border-transparent">
                                <Edit className="w-5 h-5" />
                              </Button>
                           </Link>
                           <DeleteProductButton id={p.id} name={p.name} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden space-y-6">
          {products.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-[40px] border border-zinc-100">
              <p className="font-extrabold text-zinc-900">Pristine Inventory</p>
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-[40px] border border-zinc-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-[28px] overflow-hidden bg-zinc-100 border-2 border-white shadow-md order-1">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 order-2">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[9px] font-extrabold text-brand uppercase tracking-widest bg-brand/5 px-2 py-0.5 rounded-full">{p.category.name}</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-zinc-900 line-clamp-1">{p.name}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                       <p className="text-2xl font-extrabold text-zinc-900 font-heading tracking-tight">₹{p.price}</p>
                       {p.discount > 0 && <p className="text-[10px] text-zinc-400 font-bold line-through">₹{p.originalPrice}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-50">
                   <Link href={`/admin/products/${p.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full h-14 rounded-2xl border-zinc-100 font-extrabold text-zinc-600 gap-2">
                        <Edit className="w-4 h-4" />
                        Modify
                      </Button>
                   </Link>
                   <DeleteProductButton id={p.id} name={p.name} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Global Pagination Console */}
        {products.length > 0 && (
          <div className="p-10 bg-white md:bg-zinc-50/50 rounded-[48px] border border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-4 text-center md:text-left">
              Real-time Inventory Console ({products.length} Node Sync)
            </p>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="rounded-2xl font-extrabold h-14 border-zinc-100 text-zinc-400 shadow-sm px-8">Prev</Button>
              <Button variant="outline" className="rounded-2xl font-extrabold h-14 w-14 border-brand text-brand shadow-xl shadow-brand/20 bg-white">1</Button>
              <Button variant="outline" className="rounded-2xl font-extrabold h-14 border-zinc-100 text-zinc-400 shadow-sm px-8">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
