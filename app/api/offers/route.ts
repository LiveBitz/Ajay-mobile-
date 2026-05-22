import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const offers = await prisma.bankOffer.findMany({
      where: {
        isActive: true,
        OR: [
          { validFrom: null },
          { validFrom: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { validUntil: null },
              { validUntil: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { discountValue: "desc" },
    });
    return NextResponse.json(offers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}
