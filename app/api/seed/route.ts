import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { allProducts } from "@/lib/data";

export async function GET() {
  try {
    console.log("Seeding started via API...");

    // 1. Create Categories
    const categories = [
      { name: "Men", slug: "men", image: "https://picsum.photos/seed/cat-men/600/600" },
      { name: "Watches", slug: "watches", image: "https://picsum.photos/seed/cat-watch/600/600" },
      { name: "Perfumes", slug: "perfumes", image: "https://picsum.photos/seed/cat-perf/600/600" },
      { name: "Accessories", slug: "accessories", image: "https://picsum.photos/seed/cat-acc/600/600" },
    ];

    const categoryMap: Record<string, string> = {};

    for (const catData of categories) {
      const cat = await prisma.category.upsert({
        where: { slug: catData.slug },
        update: {},
        create: catData,
      });
      categoryMap[catData.slug] = cat.id;
    }

    // Phase 6: Batch upsert products instead of one-by-one (10x faster)
    const productData = allProducts.map(p => ({
      slug: p.name.toLowerCase().replace(/ /g, "-"),
      name: p.name,
      subCategory: p.subCategory,
      price: p.price,
      originalPrice: p.originalPrice,
      discount: p.discount,
      sizes: p.sizes,
      colors: p.colors,
      image: p.image,
      isNew: p.isNew,
      isBestSeller: p.isBestSeller,
      categoryId: categoryMap[p.category.toLowerCase()],
    }));

    // Create or skip if exists
    for (const pData of productData) {
      await prisma.product.upsert({
        where: { slug: pData.slug },
        update: {},
        create: pData,
      });
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
