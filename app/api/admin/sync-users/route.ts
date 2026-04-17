import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // ✅ APPROACH 1: Try to fetch from Supabase Auth if service role key available
    let syncedCount = 0;
    let skippedCount = 0;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient: createAdminClient } = await import(
          "@supabase/supabase-js"
        );
        const adminClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: authUsers, error } = await adminClient.auth.admin.listUsers();

        if (error || !authUsers) {
          console.error("Error fetching auth users:", error);
          return NextResponse.json(
            {
              success: false,
              message: "Could not fetch auth users",
              syncedCount: 0,
            }
          );
        }

        for (const authUser of authUsers.users) {
          if (!authUser.email) {
            skippedCount++;
            continue;
          }

          try {
            await prisma.user.upsert({
              where: { id: authUser.id },
              update: {
                email: authUser.email,
                name:
                  authUser.user_metadata?.name ||
                  authUser.email.split("@")[0] ||
                  "User",
              },
              create: {
                id: authUser.id,
                email: authUser.email,
                name:
                  authUser.user_metadata?.name ||
                  authUser.email.split("@")[0] ||
                  "User",
              },
            });
            syncedCount++;
          } catch (err) {
            console.error(`Error syncing user ${authUser.id}:`, err);
          }
        }

        return NextResponse.json({
          success: true,
          message: "Synced users from Supabase Auth",
          syncedCount,
          skippedCount,
          total: authUsers.users.length,
        });
      } catch (err) {
        console.error("Error accessing admin API:", err);
        // Fall through to approach 2
      }
    }

    // ✅ APPROACH 2: Fallback - fetch users from Order and Address tables
    console.log("Falling back to database-based user sync...");

    const userIds = new Set<string>();

    // Get all unique userIds from orders
    const orders = await prisma.order.findMany({
      select: { userId: true, customerEmail: true, customerName: true },
      distinct: ["userId"],
    });

    for (const order of orders) {
      if (!order.customerEmail) continue;

      userIds.add(order.userId);

      try {
        await prisma.user.upsert({
          where: { id: order.userId },
          update: {
            email: order.customerEmail,
            name: order.customerName || "User",
          },
          create: {
            id: order.userId,
            email: order.customerEmail,
            name: order.customerName || "User",
          },
        });
        syncedCount++;
      } catch (err) {
        console.error(`Error syncing order user ${order.userId}:`, err);
      }
    }

    // Get remaining userIds from addresses
    const addresses = await prisma.address.findMany({
      select: { userId: true },
      distinct: ["userId"],
    });

    for (const address of addresses) {
      if (userIds.has(address.userId)) continue;

      userIds.add(address.userId);

      try {
        await prisma.user.create({
          data: {
            id: address.userId,
            email: `user-${address.userId}@example.com`, // Placeholder email
            name: "User",
          },
        });
        syncedCount++;
      } catch (err) {
        // User might already exist
        console.error(`Error creating user ${address.userId}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Synced users from orders and addresses",
      syncedCount,
      method: "database",
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync users" },
      { status: 500 }
    );
  }
}
