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
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const offers = await prisma.bankOffer.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(offers);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const offer = await prisma.bankOffer.create({
    data: {
      bankName: body.bankName,
      cardType: body.cardType,
      discountType: body.discountType,
      discountValue: parseFloat(body.discountValue),
      minOrderAmount: parseFloat(body.minOrderAmount ?? 0),
      maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null,
      description: body.description ?? "",
      isActive: body.isActive ?? true,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
    },
  });
  return NextResponse.json(offer, { status: 201 });
}
