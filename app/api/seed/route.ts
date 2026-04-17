import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { allProducts } from "@/lib/data";

// Development-only seeding endpoint.
// Blocked entirely in production regardless of secret.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const secret = request.headers.get("x-seed-secret");
  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const categories = [
      { name: "Men",         slug: "men",         image: "https://picsum.photos/seed/cat-men/600/600"   },
      { name: "Watches",     slug: "watches",     image: "https://picsum.photos/seed/cat-watch/600/600" },
      { name: "Perfumes",    slug: "perfumes",    image: "https://picsum.photos/seed/cat-perf/600/600"  },
      { name: "Accessories", slug: "accessories", image: "https://picsum.photos/seed/cat-acc/600/600"   },
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

    for (const p of allProducts) {
      const slug = p.name.toLowerCase().replace(/ /g, "-");
      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
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
        },
      });
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully." });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: "Seeding failed." }, { status: 500 });
  }
}
