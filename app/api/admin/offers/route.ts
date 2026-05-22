import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin-token";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_access")?.value ?? "";
  return verifyAdminToken(token);
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const offers = await prisma.bankOffer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(offers);
  } catch (err) {
    console.error("[GET /api/admin/offers]", err);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const discountValue = parseFloat(body.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      return NextResponse.json({ error: "Invalid discount value" }, { status: 400 });
    }
    const offer = await prisma.bankOffer.create({
      data: {
        bankName: body.bankName,
        cardType: body.cardType,
        discountType: body.discountType,
        discountValue,
        minOrderAmount: parseFloat(body.minOrderAmount ?? 0) || 0,
        maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null,
        description: body.description ?? "",
        isActive: body.isActive ?? true,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
      },
    });
    return NextResponse.json(offer, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/offers]", err);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
