"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(data: any) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        subCategory: data.subCategory,
        price: parseFloat(data.price),
        originalPrice: parseFloat(data.originalPrice),
        discount: parseInt(data.discount),
        stock: parseInt(data.stock) || 10,
        sizes: data.sizes,
        colors: data.colors,
        image: data.image,
        images: data.images || [],
        description: data.description || "",
        features: data.features || [],
        isNew: data.isNew,
        isBestSeller: data.isBestSeller,
        category: {
          connect: { id: data.categoryId }
        }
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, product };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        subCategory: data.subCategory,
        price: parseFloat(data.price),
        originalPrice: parseFloat(data.originalPrice),
        discount: parseInt(data.discount),
        stock: parseInt(data.stock) || 10,
        sizes: data.sizes,
        colors: data.colors,
        image: data.image,
        images: data.images || [],
        description: data.description || "",
        features: data.features || [],
        isNew: data.isNew,
        isBestSeller: data.isBestSeller,
        categoryId: data.categoryId,
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, product };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Database error" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Database error" };
  }
}

export async function seedCategories() {
  const categories = [
    { name: "Men", slug: "men", image: "https://picsum.photos/seed/cat-men/600/600" },
    { name: "Watches", slug: "watches", image: "https://picsum.photos/seed/cat-watch/600/600" },
    { name: "Perfumes", slug: "perfumes", image: "https://picsum.photos/seed/cat-perf/600/600" },
    { name: "Accessories", slug: "accessories", image: "https://picsum.photos/seed/cat-acc/600/600" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  
  revalidatePath("/admin/categories");
  return { success: true };
}
