import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const searchTerm = query.toLowerCase().trim();

    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { description: { contains: searchTerm, mode: "insensitive" } },
              { features: { hasSome: [searchTerm] } },
              { category: { name: { contains: searchTerm, mode: "insensitive" } } },
              { subCategory: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
          { stock: { gt: 0 } } // Only return products with stock > 0
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        discount: true,
        image: true,
        stock: true,
        category: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
      take: 10,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[SEARCH_API_ERROR]", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
