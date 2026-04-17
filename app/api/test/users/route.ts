import { NextResponse } from "next/server";

// This endpoint has been permanently disabled — it exposed user PII with no authentication.
export async function GET() {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}
