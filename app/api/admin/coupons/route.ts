import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { z } from "zod";

const createCouponSchema = z.object({
  code:          z.string().min(3).max(30).toUpperCase(),
  discountType:  z.enum(["percentage", "flat"]),
  discountValue: z.number().positive(),
  maxDiscount:   z.number().positive().optional().nullable(),
  minOrderAmount: z.number().min(0).default(0),
  expiresAt:     z.string().datetime().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const coupons = await prisma.couponCode.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(coupons);
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: z.infer<typeof createCouponSchema>;
  try {
    body = createCouponSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const coupon = await prisma.couponCode.create({
      data: {
        code:          body.code,
        discountType:  body.discountType,
        discountValue: body.discountValue,
        maxDiscount:   body.maxDiscount ?? null,
        minOrderAmount: body.minOrderAmount,
        expiresAt:     body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create coupon." }, { status: 500 });
  }
}
