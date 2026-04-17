"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminAction } from "@/lib/admin-auth";

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

interface BannerInput {
  type: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  buttonText?: string | null;
  link?: string | null;
  order?: number;
  isActive?: boolean;
}

export async function createBanner(data: BannerInput) {
  const auth = await verifyAdminAction();
  if (!auth.authorized) return { success: false, error: auth.error };
  try {
    const banner = await prisma.banner.create({
      data: {
        type: data.type,
        title: data.title,
        subtitle: data.subtitle ?? null,
        image: data.image ?? null,
        buttonText: data.buttonText ?? null,
        link: data.link ?? null,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    revalidatePath("/");
    return { success: true, banner };
  } catch (error) {
    console.error("Failed to create banner:", error);
    return { success: false, error: "Failed to create banner" };
  }
}

export async function updateBanner(id: string, data: Partial<BannerInput>) {
  const auth = await verifyAdminAction();
  if (!auth.authorized) return { success: false, error: auth.error };
  try {
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.buttonText !== undefined && { buttonText: data.buttonText }),
        ...(data.link !== undefined && { link: data.link }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
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
  const auth = await verifyAdminAction();
  if (!auth.authorized) return { success: false, error: auth.error };
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
  const auth = await verifyAdminAction();
  if (!auth.authorized) return { success: false, error: auth.error };
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
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' }
    });

    const categoriesWithProducts = categories.filter((c) => c._count.products > 0);

    return {
      success: true,
      categories: categoriesWithProducts.map(c => ({
        label: `${c.name} (${c._count.products})`,
        value: `/category/${c.slug}`
      })),
      products: [],
      fixed: [
        { label: "Home Page", value: "/" },
        { label: "All Categories", value: "/category" },
        { label: "Shopping Cart", value: "/cart" },
      ]
    };
  } catch (error) {
    console.error("Failed to fetch navigation links:", error);
    return { success: false, categories: [], products: [], fixed: [] };
  }
}
