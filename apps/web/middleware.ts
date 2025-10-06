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
        // Clear invalid cookie and redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url))
        response.cookies.delete("selly-user")
        return response
      }
    }

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/logout", "/access-denied"]
    
    // API routes should be handled separately
    if (pathname.startsWith("/api/")) {
      return NextResponse.next()
    }

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/lookup", "/lists", "/staff", "/admin", "/platform-admin", "/reports", "/imports", "/exports"]

    // If accessing a protected route without authentication, redirect to login
    if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Platform admin route protection
    if (pathname.startsWith("/platform-admin") && isAuthenticated) {
      if (userRole !== "platform_admin") {
        return NextResponse.redirect(new URL("/access-denied", request.url))
      }
    }

    // Customer admin route protection
    if (pathname.startsWith("/admin") && isAuthenticated) {
      if (userRole !== "admin" && userRole !== "customer_admin") {
        return NextResponse.redirect(new URL("/access-denied", request.url))
      }
    }

    // Staff route protection
    if (pathname.startsWith("/staff") && isAuthenticated) {
      if (userRole !== "staff" && userRole !== "admin" && userRole !== "customer_admin") {
        return NextResponse.redirect(new URL("/access-denied", request.url))
      }
    }

    // Redirect unauthenticated users on homepage to login
    if (pathname === "/" && !isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Redirect authenticated users on homepage to dashboard
    if (pathname === "/" && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // If any error occurs in middleware, redirect to login safely
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
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
