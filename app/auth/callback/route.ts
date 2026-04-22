import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// This route is called by Supabase after the user clicks the link in their email.
// It exchanges the code for a session, then redirects to the target page.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=reset_failed`);
}
