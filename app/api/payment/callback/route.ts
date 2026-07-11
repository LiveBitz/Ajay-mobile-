import { NextRequest, NextResponse } from "next/server";

// Pine Labs' hosted checkout delivers the post-payment redirect as a POST
// (not a GET), so it can't land directly on /payment/return — that's a plain
// page route and Next.js only serves GET for those. This endpoint accepts
// both GET and POST and forwards to the actual return page via a 303
// redirect, which always becomes a GET on the browser side. All the data we
// need (orderId) travels in the query string, which survives either method.
function forwardToReturnPage(req: NextRequest) {
  const target = new URL(`/payment/return${req.nextUrl.search}`, req.nextUrl.origin);
  return NextResponse.redirect(target, 303);
}

export async function GET(req: NextRequest) {
  return forwardToReturnPage(req);
}

export async function POST(req: NextRequest) {
  return forwardToReturnPage(req);
}
