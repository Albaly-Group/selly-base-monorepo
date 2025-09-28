import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  try {
    // Get the pathname of the request
    const { pathname } = request.nextUrl

    const userCookie = request.cookies.get("selly-user")
    let isAuthenticated = false
    let userRole = null

    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie.value)
        isAuthenticated = !!(userData && userData.id && userData.email)
        userRole = userData.role
      } catch (error) {
        // Clear invalid cookie and redirect to home
        const response = NextResponse.redirect(new URL("/", request.url))
        response.cookies.delete("selly-user")
        return response
      }
    }

    // Public routes that don't require authentication
    const publicRoutes = ["/"]
    
    // API routes should be handled separately
    if (pathname.startsWith("/api/")) {
      return NextResponse.next()
    }

    // Protected routes that require authentication
    const protectedRoutes = ["/lookup", "/lists", "/staff", "/admin", "/platform-admin", "/reports", "/imports", "/exports"]

    // If accessing a protected route without authentication, redirect to home
    if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Platform admin route protection
    if (pathname.startsWith("/platform-admin") && isAuthenticated) {
      if (userRole !== "platform_admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Customer admin route protection
    if (pathname.startsWith("/admin") && isAuthenticated) {
      if (userRole !== "admin" && userRole !== "customer_admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Staff route protection
    if (pathname.startsWith("/staff") && isAuthenticated) {
      if (userRole !== "staff" && userRole !== "admin" && userRole !== "customer_admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Role-based homepage redirects for authenticated users accessing "/"
    if (pathname === "/" && isAuthenticated) {
      if (userRole === "platform_admin") {
        return NextResponse.redirect(new URL("/platform-admin", request.url))
      }
      if (userRole === "admin" || userRole === "customer_admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      // Regular users and staff stay on homepage
    }

    return NextResponse.next()
  } catch (error) {
    // If any error occurs in middleware, redirect to home safely
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - handled separately above
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
