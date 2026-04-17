import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Simple auth check with secret header
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const secret = request.headers.get("x-seed-secret");
    if (!secret || secret !== process.env.SEED_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete existing banners
    await prisma.banner.deleteMany({});

    // Create sample banners
    const banners = await prisma.banner.createMany({
      data: [
        {
          type: "HERO",
          title: "Premium Smartphones",
          subtitle: "Latest technology at unbeatable prices",
          image: "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=1200&h=600&fit=crop",
          buttonText: "Shop Now",
          link: "/category/smartphones",
          order: 1,
          isActive: true,
        },
        {
          type: "HERO",
          title: "Apple iPhones",
          subtitle: "Experience the power of iOS",
          image: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=1200&h=600&fit=crop",
          buttonText: "View iPhones",
          link: "/category/apple",
          order: 2,
          isActive: true,
        },
        {
          type: "PROMO",
          title: "Summer Sale",
          subtitle: "Up to 50% off",
          image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=600&fit=crop",
          buttonText: "View Sale",
          link: "/category/sale",
          order: 1,
          isActive: true,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Banners seeded successfully",
      count: banners.count,
    });
  } catch (error) {
    console.error("Failed to seed banners:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed banners." },
      { status: 500 }
    );
  }
}
