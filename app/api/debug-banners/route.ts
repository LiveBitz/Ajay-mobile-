import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Development-only debug endpoint. Blocked in production.
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const secret = request.headers.get("x-debug-secret");
  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");

    const banners = await prisma.banner.findMany({
      where: typeParam ? { type: typeParam } : undefined,
    });

    return NextResponse.json({
      status: "ok",
      filter: typeParam ? { type: typeParam } : "all",
      totalBanners: banners.length,
      banners: banners.map((b) => ({
        id: b.id,
        type: b.type,
        title: b.title,
        isActive: b.isActive,
        image: b.image ? b.image.substring(0, 50) + "..." : "none",
      })),
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json({ error: "Failed to fetch banners." }, { status: 500 });
  }
}
