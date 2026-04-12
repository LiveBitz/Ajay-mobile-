import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
  const isAdminPath = pathname.startsWith('/admin')
  const isEntryPath = pathname === '/admin/entry'
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const hasAdminAccess = request.cookies.get('admin_access')?.value === 'true'
  const isSeedApi = pathname === '/api/seed-banners'
  const isDebugApi = pathname === '/api/debug-banners'
  
  const isPublicPath = 
    pathname === '/' || 
    isAuthPath ||
    isEntryPath ||
    pathname.startsWith('/auth') ||
    isSeedApi ||
    isDebugApi

  console.log('[MIDDLEWARE]', {
    pathname,
    isAdminPath,
    isEntryPath,
    isAuthPath,
    isPublicPath,
    hasAdminAccess,
    hasUser: !!user,
  })

  // Redirect authenticated users away from login/signup pages
  if (user && isAuthPath) {
    console.log('[MIDDLEWARE] Redirecting authenticated user away from auth page')
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Global Primary Identity Protection - but allow admin entry page and admin paths with passcode without login
  if (!user && !isPublicPath && !isAdminPath) {
    console.log('[MIDDLEWARE] Redirecting unauthenticated user to login')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Protect admin paths - redirect to entry if no admin access
  if (isAdminPath && !isEntryPath && !hasAdminAccess) {
    console.log('[MIDDLEWARE] Redirecting to admin entry - no admin access')
    const url = request.nextUrl.clone()
    url.pathname = '/admin/entry'
    return NextResponse.redirect(url)
  }

  console.log('[MIDDLEWARE] No redirects needed')

  return response
}
