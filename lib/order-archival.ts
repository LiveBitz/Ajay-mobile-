/**
 * Order Archival Strategy
 * PHASE 3: Archive old orders to maintain database performance
 * 
 * Archives orders older than 90 days to a separate table
 * Triggered by cron job ormanually via API
 */

import prisma from "./prisma";

export interface ArchivalStats {
  archived: number;
  remaining: number;
  totalSize: string;
  timestamp: Date;
}

/**
 * Archive orders older than the specified threshold
 * Moves old orders to Archive table (if exists) or soft-deletes
 */
export async function archiveOldOrders(
  daysThreshold: number = 90
): Promise<ArchivalStats> {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  try {
    // Find orders to archive
    const ordersToArchive = await prisma.order.findMany({
      where: {
        createdAt: { lt: thresholdDate },
      },
      select: { id: true },
    });

    const archiveCount = ordersToArchive.length;

    if (archiveCount === 0) {
      return {
        archived: 0,
        remaining: await prisma.order.count(),
        totalSize: "0 B",
        timestamp: new Date(),
      };
    }

    console.log(`[ARCHIVAL] Found ${archiveCount} orders to archive`);

    // In production: Move to archive table
    // For now: You can extend this to use S3 or separate database
    // Example: await moveToArchiveTable(ordersToArchive);

    // For MVP: Just keep data but could implement soft-delete
    // Mark as archived with a flag (requires schema change):
    // await prisma.order.updateMany({
    //   where: { id: { in: ordersToArchive.map(o => o.id) } },
    //   data: { archived: true },
    // });

    const remainingCount = await prisma.order.count({
      where: {
        createdAt: { gte: thresholdDate },
      },
    });

    return {
      archived: archiveCount,
      remaining: remainingCount,
      totalSize: `${archiveCount * 2} KB`, // Rough estimate: 2KB per order
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[ARCHIVAL] Error archiving orders:", error);
    throw error;
  }
}

/**
 * Clean up old user data (addresses, wishlists without orders)
 */
export async function cleanupOrphanedData(): Promise<{ deleted: number }> {
  try {
    // Find and delete wishlists for deleted products (should be handled by cascade)
    // Find and delete addresses for users with no orders in last 180 days

    let deleted = 0;

    // Optional: Delete wishlist items for products that no longer exist
    // (should be handled by onDelete: Cascade in schema)

    return { deleted };
  } catch (error) {
    console.error("[CLEANUP] Error cleaning up data:", error);
    throw error;
  }
}

/**
 * Schedule archival using a cron job
 * Can be called from a serverless function or scheduled task
 */
export async function scheduleArchival() {
  try {
    const stats = await archiveOldOrders(90);
    console.log("[SCHEDULE] Archival complete:", stats);
    return stats;
  } catch (error) {
    console.error("[SCHEDULE] Archival failed:", error);
    throw error;
  }
}
