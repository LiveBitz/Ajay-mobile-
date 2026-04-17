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
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isSeedApi = pathname === '/api/seed-banners'
  const isDebugApi = pathname === '/api/debug-banners'
  const isApiRoute = pathname.startsWith('/api/')

  const isPublicPath =
    pathname === '/' ||
    isAuthPath ||
    isEntryPath ||
    pathname.startsWith('/auth') ||
    isSeedApi ||
    isDebugApi ||
    isApiRoute // All API routes handle their own auth

  // Redirect authenticated users away from login/signup pages
  if (user && isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Require authentication for non-public paths
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
