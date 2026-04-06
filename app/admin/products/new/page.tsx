import React from "react";
import prisma from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  });
}

interface NewProductPageProps {
  searchParams: Promise<{ catId?: string }>;
}

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const { catId } = await searchParams;
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12">
      <ProductForm 
        categories={categories} 
        preSelectedCategoryId={catId}
      />
    </div>
  );
}
