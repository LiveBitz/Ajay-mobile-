"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Verify admin authentication
 */
const verifyAdminAuth = async (): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return { isValid: false, error: "Unauthorized: You must be logged in" };
    }
    
    // TODO: Add role-based check if you have admin roles in Supabase
    // For now, just verify user is authenticated
    return { isValid: true };
  } catch (err) {
    return { isValid: false, error: "Authentication check failed" };
  }
};

/**
 * Validates product data before saving to database
 */
const validateProductData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Name validation
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Product name is required and must be a non-empty string");
  } else if (data.name.length > 255) {
    errors.push("Product name must be 255 characters or less");
  }

  // Slug validation
  if (!data.slug || typeof data.slug !== "string" || data.slug.trim().length === 0) {
    errors.push("Product slug is required");
  }

  // Category validation
  if (!data.categoryId || typeof data.categoryId !== "string") {
    errors.push("Valid category ID is required");
  }

  // Price validation
  const price = parseFloat(data.price);
  if (isNaN(price) || price < 0) {
    errors.push("Price must be a valid positive number");
  }

  // Original price validation
  const originalPrice = parseFloat(data.originalPrice);
  if (isNaN(originalPrice) || originalPrice < 0) {
    errors.push("Original price must be a valid positive number");
  }

  // Price consistency check
  if (!isNaN(price) && !isNaN(originalPrice) && price > originalPrice) {
    errors.push("Sale price cannot be greater than original price");
  }

  // Image validation
  if (!data.image || typeof data.image !== "string") {
    errors.push("Product image is required");
  }

  // Sizes validation
  if (!Array.isArray(data.sizes) || data.sizes.length === 0) {
    errors.push("At least one size must be specified");
  }

  // Colors validation
  if (!Array.isArray(data.colors) || data.colors.length === 0) {
    errors.push("At least one color must be specified");
  }

  // Inventory validation - check format and values
  if (Array.isArray(data.sizes)) {
    data.sizes.forEach((entry: string, idx: number) => {
      if (!entry.includes(":")) {
        errors.push(`Invalid inventory format at entry ${idx + 1}: expected "SIZE-COLOR:QUANTITY"`);
        return;
      }

      const [key, qtyStr] = entry.split(":");
      if (!key || !qtyStr) {
        errors.push(`Invalid inventory entry ${idx + 1}: missing size or quantity`);
        return;
      }

      const quantity = parseInt(qtyStr);
      if (isNaN(quantity) || quantity < 0) {
        errors.push(`Invalid inventory entry ${idx + 1}: quantity must be a non-negative number`);
      }
    });
  }

  // Discount validation
  const discount = parseInt(data.discount || "0");
  if (isNaN(discount) || discount < 0 || discount > 100) {
    errors.push("Discount must be a number between 0 and 100");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export async function createProduct(data: any) {
  try {
    // ✅ VERIFY ADMIN AUTH FIRST
    const authCheck = await verifyAdminAuth();
    if (!authCheck.isValid) {
      return { success: false, error: authCheck.error || "Unauthorized" };
    }

    // Validate data before saving
    const validation = validateProductData(data);
    if (!validation.isValid) {
      return { 
        success: false, 
        error: validation.errors.join("; ")
      };
    }

    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        slug: data.slug.toLowerCase().trim(),
        subCategory: data.subCategory,
        price: parseFloat(data.price),
        originalPrice: parseFloat(data.originalPrice),
        discount: parseInt(data.discount || "0"),
        stock: 0, // Legacy field - stock now managed through size variants
        sizes: data.sizes || [],
        colors: data.colors || [],
        image: data.image,
        images: (data.images || []).filter(Boolean),
        description: data.description || "",
        features: data.features || [],
        isNew: Boolean(data.isNew),
        isBestSeller: Boolean(data.isBestSeller),
        category: {
          connect: { id: data.categoryId }
        }
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, product };
  } catch (error: any) {
    console.error("Failed to create product:", error);
    
    // Handle specific errors
    if (error.code === "P2002") {
      return { success: false, error: "Product slug must be unique" };
    }
    if (error.code === "P2025") {
      return { success: false, error: "Category not found" };
    }
    
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    // ✅ VERIFY ADMIN AUTH FIRST
    const authCheck = await verifyAdminAuth();
    if (!authCheck.isValid) {
      return { success: false, error: authCheck.error || "Unauthorized" };
    }

    // Validate data before saving
    const validation = validateProductData(data);
    if (!validation.isValid) {
      return { 
        success: false, 
        error: validation.errors.join("; ")
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name.trim(),
        slug: data.slug.toLowerCase().trim(),
        subCategory: data.subCategory,
        price: parseFloat(data.price),
        originalPrice: parseFloat(data.originalPrice),
        discount: parseInt(data.discount || "0"),
        stock: 0, // Legacy field - stock now managed through size variants
        sizes: data.sizes || [],
        colors: data.colors || [],
        image: data.image,
        images: (data.images || []).filter(Boolean),
        description: data.description || "",
        features: data.features || [],
        isNew: Boolean(data.isNew),
        isBestSeller: Boolean(data.isBestSeller),
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
    // ✅ VERIFY ADMIN AUTH FIRST
    const authCheck = await verifyAdminAuth();
    if (!authCheck.isValid) {
      return { success: false, error: authCheck.error || "Unauthorized" };
    }

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
