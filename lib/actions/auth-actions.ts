"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { generateAdminToken } from "@/lib/admin-token";

// Rate limit: 5 attempts per 15 minutes per IP
const ADMIN_LOGIN_RATE_LIMIT = { interval: 15 * 60 * 1000, maxRequests: 5 };

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Sync user record — non-fatal: a DB failure must not block login
  if (data.user?.id && data.user?.email) {
    prisma.user.upsert({
      where: { id: data.user.id },
      update: {
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email.split("@")[0] || "User",
      },
      create: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email.split("@")[0] || "User",
      },
    }).catch((err: unknown) => {
      console.error("[signIn] Failed to sync user record:", err);
    });
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  // Server-side password strength enforcement
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!/[A-Z]/.test(password)) {
    return { error: "Password must contain at least one uppercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { error: "Password must contain at least one number." };
  }

  const supabase = await createClient();

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      data: {
        name: name || email.split("@")[0], // Store name in metadata
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Sync user record — non-fatal: a DB failure must not block signup
  if (data.user?.id && email) {
    prisma.user.create({
      data: {
        id: data.user.id,
        email,
        name: name || email.split("@")[0],
      },
    }).catch((err: unknown) => {
      console.error("[signUp] Failed to create user record:", err);
    });
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Also clear admin session
  const cookieStore = await cookies();
  cookieStore.delete("admin_access");
  
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function verifyAdminPasscode(formData: FormData) {
  // --- Rate limiting ---
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const { allowed, resetIn } = rateLimit(
    `admin_login:${ip}`,
    ADMIN_LOGIN_RATE_LIMIT
  );
  if (!allowed) {
    const minutes = Math.ceil(resetIn / 60000);
    return { error: `Too many attempts. Try again in ${minutes} minute(s).` };
  }

  // --- Passcode validation ---
  const adminPasscode = process.env.ADMIN_PASSCODE;
  if (!adminPasscode || adminPasscode.length < 8) {
    // Misconfigured server — do not hint at details to the client
    console.error(
      "[ADMIN] ADMIN_PASSCODE is not set or is too short (minimum 8 characters)."
    );
    return { error: "Admin access is not configured. Contact the system administrator." };
  }

  const passcode = formData.get("passcode") as string;

  // Constant-time string comparison to prevent timing attacks
  const encoder = new TextEncoder();
  const a = encoder.encode(passcode.padEnd(adminPasscode.length));
  const b = encoder.encode(adminPasscode);
  let mismatch = a.length !== b.length ? 1 : 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) mismatch |= a[i] ^ b[i];

  if (mismatch === 0) {
    // Generate a signed token so the cookie cannot be forged
    const token = await generateAdminToken();
    const cookieStore = await cookies();
    cookieStore.set("admin_access", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    revalidatePath("/admin", "layout");
    redirect("/admin");
  }

  return { error: "Invalid administrative key." };
}

// ✅ Helper: Sync existing Supabase users to database
export async function syncUsersFromAuth() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized - admin access required" };
    }

    // Try to use admin API if service role key is available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient: createAdminClient } = await import("@supabase/supabase-js");
        const adminClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const { data: authUsers, error } = await adminClient.auth.admin.listUsers();
        
        if (error || !authUsers) {
          return { error: "Failed to fetch auth users" };
        }

        let syncedCount = 0;
        let errorCount = 0;

        for (const authUser of authUsers.users) {
          // Only sync users with email (required for unique constraint)
          if (!authUser.email) {
            errorCount++;
            continue;
          }

          try {
            await prisma.user.upsert({
              where: { id: authUser.id },
              update: {
                email: authUser.email,
                name: authUser.user_metadata?.name || authUser.email.split("@")[0] || "User",
              },
              create: {
                id: authUser.id,
                email: authUser.email,
                name: authUser.user_metadata?.name || authUser.email.split("@")[0] || "User",
              },
            });
            syncedCount++;
          } catch (err) {
            console.error(`Error syncing user ${authUser.id}:`, err);
            errorCount++;
          }
        }

        return {
          success: true,
          syncedCount,
          errorCount,
          totalUsers: authUsers.users.length,
        };
      } catch (err) {
        console.error("Admin sync error:", err);
        return { error: "Failed to access admin API" };
      }
    }

    return { error: "SUPABASE_SERVICE_ROLE_KEY not configured" };
  } catch (err) {
    console.error("Sync error:", err);
    return { error: "Sync failed" };
  }
}
