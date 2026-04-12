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

  // 3. Create Sample Banners
  const banners = [
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
  ];

  // Delete existing banners
  await prisma.banner.deleteMany({});

  for (const banner of banners) {
    await prisma.banner.create({
      data: banner,
    });
    console.log(`Created banner: ${banner.type} - ${banner.title}`);
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
