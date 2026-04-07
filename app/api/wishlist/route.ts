import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user's wishlist
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existingWishlist = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existingWishlist) {
      // Remove from wishlist
      await prisma.wishlist.delete({
        where: {
          userId_productId: {
            userId: user.id,
            productId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Removed from wishlist",
        action: "removed",
      });
    } else {
      // Add to wishlist
      const wishlistItem = await prisma.wishlist.create({
        data: {
          userId: user.id,
          productId,
        },
        include: { product: true },
      });

      return NextResponse.json({
        success: true,
        message: "Added to wishlist",
        action: "added",
        data: wishlistItem,
      });
    }
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}
