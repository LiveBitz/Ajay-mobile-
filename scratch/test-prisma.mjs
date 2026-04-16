import prisma from "./lib/prisma.js";

async function testActions() {
  try {
    const cats = await prisma.category.findMany({
      include: {
        parent: { select: { name: true } },
        children: true
      }
    });
    console.log("Prisma hierarchy query successful. Count:", cats.length);

    const groups = await prisma.featuredGroup.findMany();
    console.log("Prisma featured group query successful. Count:", groups.length);
    
    process.exit(0);
  } catch (e) {
    console.error("Prisma query failed:", e);
    process.exit(1);
  }
}

testActions();
