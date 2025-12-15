import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './src/i18n'

// Create next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
})

export function proxy(request: NextRequest) {
  try {
    // Get the pathname of the request
    const { pathname } = request.nextUrl

    // Handle locale routing first for all paths except API and static files
    if (!pathname.startsWith('/api/') && 
        !pathname.startsWith('/_next/') && 
        !pathname.startsWith('/_vercel/') &&
        !pathname.match(/\.\w+$/)) {
      
      // Apply intl middleware
      const intlResponse = intlMiddleware(request)
      
      // If intl middleware returns a redirect, use it
      if (intlResponse.status === 307 || intlResponse.status === 308) {
        return intlResponse
      }
    }

    const userCookie = request.cookies.get("selly-user")
    let isAuthenticated = false
    let userRole = null

    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie.value)
        isAuthenticated = !!(userData && userData.id && userData.email)
        userRole = userData.role
      } catch (error) {
        // Clear invalid cookie and redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url))
        response.cookies.delete("selly-user")
        return response
      }
    }

    // Extract locale from pathname (e.g., /en/dashboard -> en)
    const localeMatch = pathname.match(/^\/(en|th)(\/|$)/)
    const currentLocale = localeMatch ? localeMatch[1] : defaultLocale
    
    // Remove locale from pathname for route checking.
    const pathnameWithoutLocale = localeMatch ? pathname.replace(new RegExp(`^\/${localeMatch[1]}`), '') || '/' : pathname
    
    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/logout", "/access-denied"]
    
    // API routes should be handled separately
    if (pathname.startsWith("/api/")) {
      return NextResponse.next()
    }

    // Protected routes that require authentication (without locale prefix)
    const protectedRoutes = ["/dashboard", "/lookup", "/lists", "/staff", "/admin", "/platform-admin", "/reports", "/imports", "/exports"]

    // If accessing a protected route without authentication, redirect to login
    if (protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route)) && !isAuthenticated) {
      return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url))
    }

    // Platform admin route protection
    if (pathnameWithoutLocale.startsWith("/platform-admin") && isAuthenticated) {
      if (userRole !== "platform_admin") {
        return NextResponse.redirect(new URL(`/${currentLocale}/access-denied`, request.url))
      }
    }

    // Customer admin route protection
    if (pathnameWithoutLocale.startsWith("/admin") && isAuthenticated) {
      if (userRole !== "admin" && userRole !== "customer_admin") {
        return NextResponse.redirect(new URL(`/${currentLocale}/access-denied`, request.url))
      }
    }

    // Staff route protection
    if (pathnameWithoutLocale.startsWith("/staff") && isAuthenticated) {
      if (userRole !== "staff" && userRole !== "admin" && userRole !== "customer_admin") {
        return NextResponse.redirect(new URL(`/${currentLocale}/access-denied`, request.url))
      }
    }

    // Redirect unauthenticated users on homepage to login
    if (pathnameWithoutLocale === "/" && !isAuthenticated) {
      return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url))
    }

    // Redirect authenticated users on homepage to dashboard
    if (pathnameWithoutLocale === "/" && isAuthenticated) {
      return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // If any error occurs in proxy, redirect to login safely
    console.error("Proxy error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internals)
     * - _vercel (Vercel internals)
     * - Static files (images, etc.)
     */
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
