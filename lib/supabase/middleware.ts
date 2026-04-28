import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-token'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminPath = pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')
  const isEntryPath = pathname === '/admin/entry'
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password')
  const isResetPath = pathname.startsWith('/reset-password')
  const isSeedApi = pathname === '/api/seed-banners'
  const isDebugApi = pathname === '/api/debug-banners'
  const isApiRoute = pathname.startsWith('/api/')

  const isPublicPath =
    pathname === '/' ||
    isAuthPath ||
    isEntryPath ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/category') ||
    pathname.startsWith('/product') ||
    pathname.startsWith('/search') ||
    pathname === '/terms' ||
    pathname === '/privacy' ||
    pathname === '/refund-policy' ||
    isSeedApi ||
    isDebugApi ||
    isApiRoute // All API routes handle their own auth

  // Redirect authenticated users away from gate-keeping pages (login, signup, forgot-password)
  // EXCEPT when they are on the reset-password page (which requires a session)
  if (user && isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Strict check for /reset-password: Must have the specific verification cookie
  if (pathname === '/reset-password') {
    const resetAllowed = request.cookies.get('reset_password_allowed')?.value === 'true'
    if (!resetAllowed) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'unauthorized_reset')
      return NextResponse.redirect(url)
    }
  }

  // Require authentication for non-public paths (this now includes /reset-password)
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Protect admin paths — verify HMAC-signed token (not just a plain cookie value)
  if (isAdminPath && !isEntryPath) {
    const adminCookieValue = request.cookies.get('admin_access')?.value ?? ''
    const hasValidAdminToken = await verifyAdminToken(adminCookieValue)
    if (!hasValidAdminToken) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/entry'
      return NextResponse.redirect(url)
    }
  }

  return response
}
