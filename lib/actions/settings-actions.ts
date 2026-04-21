"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminAction } from "@/lib/admin-auth";

/**
 * 🚀 Fetch a site setting by its unique key
 * @param key The setting key (e.g., 'show_featured_categories')
 * @param defaultValue The value to return if the setting doesn't exist
 */
export async function getSiteSetting(key: string, defaultValue: string = "true") {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key },
    });

    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error(`Failed to fetch site setting [${key}]:`, error);
    return defaultValue;
  }
}

/**
 * 🚀 Update or create a site setting
 * @param key The setting key
 * @param value The value to store (stored as string)
 */
export async function updateSiteSetting(key: string, value: string) {
  const auth = await verifyAdminAction();
  if (!auth.authorized) return { success: false, message: auth.error };

  try {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // Revalidate affected paths
    revalidatePath("/");
    revalidatePath("/admin/featured-categories");

    return { success: true };
  } catch (error: any) {
    console.error(`Failed to update site setting [${key}]:`, error);
    return { success: false, message: error.message || "Failed to preserve site configuration" };
  }
}
