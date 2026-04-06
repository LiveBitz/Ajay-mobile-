import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id }
  });
  return product;
}

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  });
}

async function getUniqueSubCategories() {
  const products = await prisma.product.findMany({
    select: { categoryId: true, subCategory: true },
    orderBy: { subCategory: 'asc' }
  });
  
  const mapping: Record<string, string[]> = {};
  products.forEach(p => {
    if (!p.subCategory) return;
    if (!mapping[p.categoryId]) {
      mapping[p.categoryId] = [];
    }
    if (!mapping[p.categoryId].includes(p.subCategory)) {
      mapping[p.categoryId].push(p.subCategory);
    }
  });
  
  return mapping;
}

export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const [product, categories, subCategories] = await Promise.all([
    getProduct(id),
    getCategories(),
    getUniqueSubCategories()
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12">
      <ProductForm 
        initialData={product} 
        categories={categories} 
        existingSubCategories={subCategories}
      />
    </div>
  );
}
