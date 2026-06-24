import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, subtotal } = await request.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
  }

  const coupon = await prisma.couponCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon) {
    return NextResponse.json({ error: "Invalid coupon code." }, { status: 404 });
  }
  if (!coupon.isActive) {
    return NextResponse.json({ error: "This coupon is no longer active." }, { status: 400 });
  }
  if (coupon.usedAt) {
    return NextResponse.json({ error: "This coupon has already been used." }, { status: 400 });
  }
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
  }
  if (typeof subtotal === "number" && subtotal < coupon.minOrderAmount) {
    return NextResponse.json(
      { error: `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString("en-IN")} required.` },
      { status: 400 }
    );
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === "flat") {
    discount = coupon.discountValue;
  } else {
    const raw = (subtotal * coupon.discountValue) / 100;
    discount = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  }
  discount = Math.round(Math.max(0, Math.min(subtotal, discount)));

  return NextResponse.json({
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscount: coupon.maxDiscount,
    discount,
  });
}
