"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminAction } from "@/lib/admin-auth";

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: {
        parent: {
          select: { name: true }
        },
        children: true
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function createCategory(name: string, image: string = "", parentId: string | null = null) {
  const auth = await verifyAdminAction();
  if (!auth.authorized) return { success: false, error: auth.error };
  try {
    // Validate input
    if (!name || name.trim().length === 0) {
      return { success: false, error: "Category name is required" };
    }
    
    // Auto-generate slug from name
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if category with same slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return { success: false, error: `A category named "${name}" already exists` };
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        image: image || "",
        parentId: parentId || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    
    return { success: true, category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategoryImage(id: string, imageUrl: string) {
  const auth = await verifyAdminAction();
  if (!auth.authorized) return { success: false, error: auth.error };
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { image: imageUrl },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    
    return { success: true, category };
  } catch (error) {
    console.error("Failed to update category image:", error);
    return { success: false, error: "Failed to update visual asset" };
  }
}

export async function updateCategory(id: string, data: { name?: string, image?: string, parentId?: string | null }) {
  const auth = await verifyAdminAction();
  if (!auth.authorized) return { success: false, error: auth.error };
  try {
    const updateData: any = { ...data };
    
    // If name is being updated, regenerate slug
    if (data.name) {
      updateData.slug = data.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/featured-categories");
    revalidatePath("/");
    
    return { success: true, category };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  const auth = await verifyAdminAction();
  if (!auth.authorized) return { success: false, error: auth.error };
  try {
    // Check if category has any products
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete category with ${productsCount} product(s). Please move or delete the products first.` 
      };
    }

    // Check if category has any children
    const childrenCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete category with ${childrenCount} sub-collection(s). Please move or delete the sub-collections first.` 
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
