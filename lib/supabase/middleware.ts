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

  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isEntryPath = request.nextUrl.pathname === '/admin/entry'
  const isPublicPath = 
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/auth')

  // Global Primary Identity Protection
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Administrative Passcode Shield
  if (user && isAdminPath && !isEntryPath) {
    const adminAccess = request.cookies.get('admin_access')
    
    if (!adminAccess || adminAccess.value !== 'true') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/entry'
      return NextResponse.redirect(url)
    }
  }

  return response
}
