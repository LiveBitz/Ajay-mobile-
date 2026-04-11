import { PrismaClient } from "@prisma/client";
import { allProducts } from "../lib/data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Create Categories
  const categories = [
    { name: "Apple", slug: "apple", image: "https://picsum.photos/seed/cat-apple/600/600" },
    { name: "Samsung", slug: "samsung", image: "https://picsum.photos/seed/cat-samsung/600/600" },
    { name: "OnePlus", slug: "oneplus", image: "https://picsum.photos/seed/cat-oneplus/600/600" },
    { name: "Xiaomi", slug: "xiaomi", image: "https://picsum.photos/seed/cat-xiaomi/600/600" },
    { name: "Realme", slug: "realme", image: "https://picsum.photos/seed/cat-realme/600/600" },
    { name: "Poco", slug: "poco", image: "https://picsum.photos/seed/cat-poco/600/600" },
  ];

  const categoryMap: Record<string, string> = {};

  for (const catData of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {},
      create: catData,
    });
    categoryMap[catData.slug] = cat.id;
    console.log(`Created category: ${cat.name}`);
  }

  // 2. Create Products
  for (const p of allProducts) {
    await prisma.product.upsert({
      where: { slug: p.name.toLowerCase().replace(/ /g, "-") },
      update: {},
      create: {
        name: p.name,
        slug: p.name.toLowerCase().replace(/ /g, "-"),
        subCategory: p.subCategory,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        stock: p.stock || 0,
        sizes: p.sizes,
        colors: p.colors,
        image: p.image,
        isNew: p.isNew,
        isBestSeller: p.isBestSeller,
        categoryId: categoryMap[p.category.toLowerCase()],
      },
    });
    console.log(`Created product: ${p.name}`);
  }

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
