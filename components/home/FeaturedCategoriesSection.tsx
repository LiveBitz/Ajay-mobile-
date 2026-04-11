import React from "react";
import prisma from "@/lib/prisma";
import { CategoryGrid } from "@/components/home/CategoryGrid";

async function getFeaturedCategories() {
  const categories = await prisma.category.findMany({
    where: {
      isFeatured: true,
    },
    orderBy: {
      featuredOrder: 'asc',
    },
  });

  return categories;
}

export async function FeaturedCategoriesSection() {
  const categories = await getFeaturedCategories();

  if (categories.length === 0) return null;

  return <CategoryGrid categories={categories} />;
}
