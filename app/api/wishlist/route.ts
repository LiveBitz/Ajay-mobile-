import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

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

    // Fetch user's wishlist with selective fields (Phase 6 Optimization)
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        userId: true,
        productId: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            price: true,
            originalPrice: true,
            discount: true,
            stock: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const response = NextResponse.json(wishlist);
    // Phase 6: Cache wishlist for 1 minute on client
    response.headers.set("Cache-Control", "private, max-age=60, s-maxage=0");
    return response;
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
    // ✅ RATE LIMITING - Prevent wishlist spam
    const clientIp = getClientIp(req);
    const limitCheck = rateLimit(clientIp, RATE_LIMITS.WISHLIST);

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many wishlist requests. Please try again later.",
          retryAfter: Math.ceil(limitCheck.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(limitCheck.resetIn / 1000).toString(),
          },
        }
      );
    }

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

    // ✅ USE ATOMIC OPERATION: Try to create. If unique constraint exists, delete instead.
    // This prevents TOCTOU race conditions.
    try {
      const wishlistItem = await prisma.wishlist.create({
        data: {
          userId: user.id,
          productId,
        },
        select: {
          id: true,
          productId: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              price: true,
              originalPrice: true,
              discount: true,
              stock: true,
            }
          }
        },
      });

      return NextResponse.json({
        success: true,
        message: "Added to wishlist",
        action: "added",
        data: wishlistItem,
      });
    } catch (error: any) {
      // If unique constraint violation, item already exists - remove it
      if (error.code === "P2002") {
        try {
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
        } catch (deleteError) {
          // Item might have been deleted by another request - this is ok
          console.error("Error deleting wishlist item:", deleteError);
          return NextResponse.json({
            success: true,
            message: "Wishlist state synchronized",
            action: "removed",
          });
        }
      }
      // Re-throw other errors
      throw error;
    }
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}
