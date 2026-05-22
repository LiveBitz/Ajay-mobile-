import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin-token";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_access")?.value ?? "";
  return verifyAdminToken(token);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const discountValue = parseFloat(body.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      return NextResponse.json({ error: "Invalid discount value" }, { status: 400 });
    }
    const offer = await prisma.bankOffer.update({
      where: { id },
      data: {
        bankName: body.bankName,
        cardType: body.cardType,
        discountType: body.discountType,
        discountValue,
        minOrderAmount: parseFloat(body.minOrderAmount ?? 0) || 0,
        maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null,
        description: body.description ?? "",
        isActive: body.isActive,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
      },
    });
    return NextResponse.json(offer);
  } catch (err) {
    console.error("[PUT /api/admin/offers/[id]]", err);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const { isActive } = await req.json();
    const offer = await prisma.bankOffer.update({
      where: { id },
      data: { isActive },
    });
    return NextResponse.json(offer);
  } catch (err) {
    console.error("[PATCH /api/admin/offers/[id]]", err);
    return NextResponse.json({ error: "Failed to toggle offer" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await prisma.bankOffer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/offers/[id]]", err);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
