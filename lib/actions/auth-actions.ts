"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

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

  // ✅ Create or update user in database on login
  if (data.user?.id && data.user?.email) {
    try {
      await prisma.user.upsert({
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
      });
    } catch (err) {
      console.error("Error upserting user on login:", err);
      // Don't block login if user creation fails
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string; // Get name from form
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

  // ✅ Create user in database immediately upon signup
  if (data.user?.id && email) {
    try {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: email,
          name: name || email.split("@")[0],
        },
      });
    } catch (err) {
      console.error("Error creating user in database:", err);
      // Don't block signup if user creation fails
    }
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
  const passcode = formData.get("passcode") as string;
  const adminPasscode = process.env.ADMIN_PASSCODE || "7014";

  if (passcode === adminPasscode) {
    const cookieStore = await cookies();
    cookieStore.set("admin_access", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
