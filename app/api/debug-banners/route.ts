import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const secret = request.headers.get("x-debug-secret");
    if (secret !== "debug-banners") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");

    console.log("Debug API called - type:", typeParam);

    let query: any = {};
    if (typeParam) {
      query.type = typeParam;
    }

    const banners = await prisma.banner.findMany({
      where: query,
    });

    console.log("Banners found:", banners);

    return NextResponse.json({
      status: "ok",
      filter: typeParam ? { type: typeParam } : "all",
      totalBanners: banners.length,
      banners: banners.map(b => ({
        id: b.id,
        type: b.type,
        title: b.title,
        isActive: b.isActive,
        image: b.image ? b.image.substring(0, 50) + "..." : "none",
      })),
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch banners", 
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
