import prisma from "@/lib/prisma";

async function seedCategories() {
  try {
    console.log("Seeding categories...");

    const categories = [
      {
        name: "Men",
        slug: "men",
        image: "https://picsum.photos/seed/cat-men/600/600",
      },
      {
        name: "Watches",
        slug: "watches",
        image: "https://picsum.photos/seed/cat-watch/600/600",
      },
      {
        name: "Perfumes",
        slug: "perfumes",
        image: "https://picsum.photos/seed/cat-perf/600/600",
      },
      {
        name: "Accessories",
        slug: "accessories",
        image: "https://picsum.photos/seed/cat-acc/600/600",
      },
    ];

    for (const cat of categories) {
      const result = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {}, // Don't update if exists
        create: cat,
      });
      console.log(`✅ ${result.name} (${result.slug})`);
    }

    console.log("\n✅ All categories seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
