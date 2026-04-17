/**
 * Admin authorization helpers.
 *
 * Every admin server action and API route must call one of these before
 * touching any data. Two checks are enforced in order:
 *
 *   1. Supabase session  — the request comes from a signed-in user.
 *   2. Admin token       — the user has passed the admin passcode and holds
 *                          a valid HMAC-signed admin_access cookie.
 *
 * Passing only check 1 (a normal logged-in user) is NOT enough.
 * An attacker who creates a user account cannot reach admin data.
 */

import { createClient } from "@/lib/supabase/server";
import { verifyAdminToken } from "@/lib/admin-token";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

// ─── Result type ────────────────────────────────────────────────────────────

export type AdminAuthResult =
  | { authorized: true }
  | { authorized: false; error: string; status: 401 | 403 | 500 };

// ─── Internal shared logic ───────────────────────────────────────────────────

async function checkAdminToken(tokenValue: string): Promise<boolean> {
  return verifyAdminToken(tokenValue);
}

// ─── For server actions ("use server" files) ─────────────────────────────────

/**
 * Call at the top of every admin server action.
 *
 * @example
 * const auth = await verifyAdminAction();
 * if (!auth.authorized) return { success: false, error: auth.error };
 */
export async function verifyAdminAction(): Promise<AdminAuthResult> {
  try {
    // 1. Supabase session check
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return { authorized: false, error: "Unauthorized: not logged in.", status: 401 };
    }

    // 2. Admin token check
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_access")?.value ?? "";
    const isAdmin = await checkAdminToken(adminToken);
    if (!isAdmin) {
      return {
        authorized: false,
        error: "Forbidden: valid admin session required.",
        status: 403,
      };
    }

    return { authorized: true };
  } catch {
    return { authorized: false, error: "Authentication check failed.", status: 500 };
  }
}

// ─── For API route handlers (NextRequest) ────────────────────────────────────

/**
 * Call at the top of every admin API route handler.
 *
 * @example
 * const auth = await verifyAdminRequest(request);
 * if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
 */
export async function verifyAdminRequest(request: NextRequest): Promise<AdminAuthResult> {
  try {
    // 1. Supabase session check
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return { authorized: false, error: "Unauthorized: not logged in.", status: 401 };
    }

    // 2. Admin token check
    const adminToken = request.cookies.get("admin_access")?.value ?? "";
    const isAdmin = await checkAdminToken(adminToken);
    if (!isAdmin) {
      return {
        authorized: false,
        error: "Forbidden: valid admin session required.",
        status: 403,
      };
    }

    return { authorized: true };
  } catch {
    return { authorized: false, error: "Authentication check failed.", status: 500 };
  }
}
