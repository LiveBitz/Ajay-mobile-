/**
 * Cron endpoint — archive orders older than 90 days.
 *
 * Triggered automatically by Vercel Cron (see vercel.json).
 * Protected by CRON_SECRET so it cannot be called by arbitrary clients.
 *
 * Manual trigger (admin use):
 *   curl -X POST https://your-domain/api/cron/archive-orders \
 *        -H "Authorization: Bearer <CRON_SECRET>"
 */

import { NextRequest, NextResponse } from "next/server";
import { archiveOldOrders } from "@/lib/order-archival";

export async function POST(request: NextRequest) {
  // Verify the request comes from Vercel Cron or an authorised caller
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[CRON] CRON_SECRET is not set — cron endpoint is disabled.");
    return NextResponse.json({ error: "Cron not configured." }, { status: 503 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const stats = await archiveOldOrders(90);
    console.log("[CRON] Order archival complete:", stats);
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("[CRON] Order archival failed:", error);
    return NextResponse.json({ error: "Archival failed." }, { status: 500 });
  }
}
