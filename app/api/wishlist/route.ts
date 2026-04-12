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

    // ✅ Ensure User record exists (for foreign key constraint)
    if (!user.email) {
      console.warn("User has no email, cannot create User record");
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    const userName = user.user_metadata?.name || user.email.split("@")[0] || "User";

    // ✅ STEP 1: Ensure User exists in database first
    try {
      // Use a direct upsert, not in transaction
      const createdUser = await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          name: userName,
        },
        create: {
          id: user.id,
          email: user.email,
          name: userName,
        },
      });
      console.log("User record ensured:", createdUser.id);
    } catch (err: any) {
      console.error("Error ensuring user record:", {
        error: err.message,
        code: err.code,
        userId: user.id,
        userEmail: user.email,
      });
      // Still try to proceed - user might already exist but with an error
    }

    // ✅ STEP 2: Now handle wishlist (user should exist)
    try {
      // Check if already in wishlist
      const existing = await prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId: user.id,
            productId,
          },
        },
      });

      if (existing) {
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
      }
    } catch (error: any) {
      console.error("Wishlist operation error:", {
        error: error.message,
        code: error.code,
        userId: user.id,
        productId,
      });
      return NextResponse.json(
        { error: "Failed to update wishlist: " + error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}
