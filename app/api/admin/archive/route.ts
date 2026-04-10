import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { archiveOldOrders } from "@/lib/order-archival";

/**
 * Admin endpoint to trigger order archival
 * PHASE 3: Archive old orders to maintain database performance
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Check if user is admin
    // For now, just verify authentication

    const { daysThreshold = 90 } = await request.json();

    // Validate threshold
    if (!Number.isInteger(daysThreshold) || daysThreshold < 1 || daysThreshold > 365) {
      return NextResponse.json(
        { error: "daysThreshold must be between 1 and 365" },
        { status: 400 }
      );
    }

    const stats = await archiveOldOrders(daysThreshold);

    return NextResponse.json({
      success: true,
      message: `Archived ${stats.archived} orders`,
      stats,
    });
  } catch (error) {
    console.error("Archive error:", error);
    return NextResponse.json(
      { error: "Failed to archive orders" },
      { status: 500 }
    );
  }
}
