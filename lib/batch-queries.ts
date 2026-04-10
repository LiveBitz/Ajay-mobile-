/**
 * Batch query utilities
 * PHASE 2: Prevent N+1 queries by batching reads
 */

import prisma from "./prisma";

/**
 * Get multiple products in single query with selective fields
 */
export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];

  return await prisma.product.findMany({
    where: {
      id: { in: ids },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      stock: true,
      isNew: true,
      isBestSeller: true,
      categoryId: true,
    },
  });
}

/**
 * Check if products are in user's wishlist in single query
 */
export async function checkWishlistStatus(userId: string, productIds: string[]) {
  if (productIds.length === 0) return new Map();

  const wishlisted = await prisma.wishlist.findMany({
    where: {
      userId,
      productId: { in: productIds },
    },
    select: {
      productId: true,
    },
  });

  const wishlistMap = new Map<string, boolean>();
  productIds.forEach(id => wishlistMap.set(id, false));
  wishlisted.forEach(item => wishlistMap.set(item.productId, true));

  return wishlistMap;
}

/**
 * Get category details for multiple category IDs
 */
export async function getCategoriesByIds(categoryIds: string[]) {
  if (categoryIds.length === 0) return [];

  return await prisma.category.findMany({
    where: {
      id: { in: categoryIds },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
    },
  });
}

/**
 * Get order items with product details
 */
export async function getOrderItemsWithProducts(orderId: string) {
  return await prisma.orderItem.findMany({
    where: { orderId },
    select: {
      id: true,
      quantity: true,
      price: true,
      size: true,
      color: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Get user's wishlist items with product details
 */
export async function getUserWishlist(userId: string) {
  return await prisma.wishlist.findMany({
    where: { userId },
    select: {
      id: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          originalPrice: true,
          discount: true,
          image: true,
          stock: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
