"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBanners(type?: string) {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        ...(type ? { type } : {}),
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });
    
    return banners;
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return [];
  }
}

export async function getAllBanners() {
  try {
    // Defensive check for stale dev server cache
    if (!(prisma as any).banner) {
      return [];
    }

    const banners = await (prisma as any).banner.findMany({
      orderBy: [
        { type: "asc" },
        { order: "asc" },
      ],
    });
    return banners;
  } catch (error) {
    console.error("Failed to fetch all banners:", error);
    return [];
  }
}

export async function createBanner(data: any) {
  try {
    const banner = await prisma.banner.create({
      data: {
        ...data,
      },
    });
    revalidatePath("/");
    return { success: true, banner };
  } catch (error) {
    console.error("Failed to create banner:", error);
    return { success: false, error: "Failed to create banner" };
  }
}

export async function updateBanner(id: string, data: any) {
  try {
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...data,
      },
    });
    revalidatePath("/");
    return { success: true, banner };
  } catch (error) {
    console.error("Failed to update banner:", error);
    return { success: false, error: "Failed to update banner" };
  }
}

export async function deleteBanner(id: string) {
  try {
    await prisma.banner.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete banner:", error);
    return { success: false, error: "Failed to delete banner" };
  }
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
  try {
    await prisma.banner.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle banner status:", error);
    return { success: false, error: "Failed to toggle banner status" };
  }
}

export async function getNavigationLinks() {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        select: { name: true, slug: true },
        orderBy: { name: 'asc' }
      }),
      prisma.product.findMany({
        select: { name: true, slug: true },
        orderBy: { createdAt: 'desc' },
        take: 20 // Limit to latest 20 for UX sanity
      })
    ]);

    return {
      success: true,
      categories: categories.map(c => ({ label: c.name, value: `/category/${c.slug}` })),
      products: products.map(p => ({ label: p.name, value: `/product/${p.slug}` })),
      fixed: [
        { label: "Home Page", value: "/" },
        { label: "Shopping Cart", value: "/cart" },
      ]
    };
  } catch (error) {
    console.error("Failed to fetch navigation links:", error);
    return { success: false, categories: [], products: [], fixed: [] };
  }
}
