"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Toggle featured status for a category
export async function toggleCategoryFeatured(categoryId: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        isFeatured: !category.isFeatured,
        // If marking as featured and no order set, set to 999
        featuredOrder: !category.isFeatured ? (category.featuredOrder === null ? 999 : category.featuredOrder) : category.featuredOrder,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: `Category ${updated.isFeatured ? "featured" : "unfeatured"} successfully`,
      isFeatured: updated.isFeatured,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update category",
    };
  }
}

// Update featured category order
export async function updateCategoryFeaturedOrder(categoryId: string, order: number) {
  try {
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        featuredOrder: order,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Featured order updated successfully",
      featuredOrder: updated.featuredOrder,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update featured order",
    };
  }
}

// Get all featured categories
export async function getFeaturedCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isFeatured: true,
      },
      orderBy: {
        featuredOrder: "asc",
      },
    });

    return {
      success: true,
      categories,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch featured categories",
    };
  }
}
