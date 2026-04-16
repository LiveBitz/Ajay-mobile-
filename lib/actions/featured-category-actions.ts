"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 🚀 Get all featured groups with their associated categories
export async function getFeaturedGroups() {
  try {
    const groups = await prisma.featuredGroup.findMany({
      include: {
        categories: {
          include: {
            children: true // Show nested collections
          },
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        order: "asc",
      },
    });

    return {
      success: true,
      groups,
    };
  } catch (error: any) {
    console.error("Failed to fetch featured groups:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch showcase sections",
    };
  }
}

// 🚀 Create a new Featured Group
export async function createFeaturedGroup(data: { name: string, image?: string, categoryIds?: string[] }) {
  try {
    const { name, image, categoryIds } = data;
    
    if (!name.trim()) {
      return { success: false, message: "Group name is required" };
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const group = await prisma.featuredGroup.create({
      data: {
        name: name.trim(),
        slug,
        image: image || "",
        categories: categoryIds ? {
          connect: categoryIds.map(id => ({ id }))
        } : undefined
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/featured-categories");
    
    return { success: true, group };
  } catch (error: any) {
    console.error("Failed to create featured group:", error);
    return { success: false, message: error.message || "Failed to establish new group" };
  }
}

// 🚀 Update a Featured Group
export async function updateFeaturedGroup(id: string, data: { name?: string, image?: string, order?: number, categoryIds?: string[] }) {
  try {
    const { name, image, order, categoryIds } = data;
    const updateData: any = {};
    
    if (name) {
      updateData.name = name.trim();
      updateData.slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (image !== undefined) updateData.image = image;
    if (order !== undefined) updateData.order = order;
    
    if (categoryIds) {
      // First disconnect all existing
      await prisma.featuredGroup.update({
        where: { id },
        data: {
          categories: { set: [] }
        }
      });
      // Then connect new ones
      updateData.categories = {
        connect: categoryIds.map(id => ({ id }))
      };
    }

    const group = await prisma.featuredGroup.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/admin/featured-categories");
    
    return { success: true, group };
  } catch (error: any) {
    console.error("Failed to update featured group:", error);
    return { success: false, message: error.message || "Failed to update group" };
  }
}

// 🚀 Delete a Featured Group
export async function deleteFeaturedGroup(id: string) {
  try {
    // Note: Category relation is optional, so we can just delete the group.
    // The categories will remain but their featuredGroupId will become null (Prisma handles this if not Cascade)
    await prisma.featuredGroup.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/featured-categories");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete featured group:", error);
    return { success: false, message: "Failed to retire showcase section" };
  }
}

// ⚠️ DEPRECATED: Toggling logic is removed as requested
export async function toggleCategoryFeatured(categoryId: string) {
  return { success: false, message: "Toggling is deprecated. Use Featured Groups instead." };
}

// ⚠️ DEPRECATED: Direct order logic on Category is removed
export async function updateCategoryFeaturedOrder(categoryId: string, order: number) {
  return { success: false, message: "Category-level ordering is deprecated." };
}
