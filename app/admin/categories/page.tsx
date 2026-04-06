import React from "react";
import {
  Layers,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  FolderOpen
} from "lucide-react";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
}

export default async function CategoriesAdminPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 overflow-hidden">
        <div className="space-y-1 sm:space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-zinc-900 px-1">
            Collections
          </h1>
          <p className="text-zinc-500 font-medium text-sm sm:text-base leading-relaxed px-2">
            Organize your store's <span className="text-brand font-bold">Core Clusters</span>.
          </p>
        </div>
        <Button className="bg-brand hover:bg-brand/90 text-white gap-3 rounded-[24px] h-16 px-10 shadow-2xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95 font-extrabold w-full lg:w-auto">
          <Plus className="w-6 h-6" />
          Add New Collection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full bg-white p-20 text-center rounded-3xl border border-zinc-100 shadow-sm border-dashed">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-zinc-300" />
            </div>
            <p className="font-bold text-lg text-zinc-900">No categories found</p>
            <p className="text-zinc-400 text-sm">Create your first collection to start organizing products.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="relative h-48 overflow-hidden bg-zinc-100">
                <img src={cat.image || ""} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent p-6 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-xl">{cat.name}</h3>
                      <p className="text-zinc-200 text-xs font-medium uppercase tracking-widest">{cat._count.products} Products</p>
                    </div>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-md">
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between gap-2 bg-white">
                <Button variant="outline" className="flex-1 rounded-xl h-10 font-bold text-xs gap-2 border-zinc-100">
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl h-10 font-bold text-xs gap-2 border-zinc-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
