import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl

  const userCookie = request.cookies.get("selly-user")
  let isAuthenticated = false
  let userRole = null

  if (userCookie && userCookie.value) {
    try {
      const cookieValue = userCookie.value.trim()
      if (cookieValue && cookieValue !== "undefined" && cookieValue !== "null" && cookieValue.startsWith("{")) {
        const userData = JSON.parse(cookieValue)
        isAuthenticated = !!(userData && userData.id && userData.email)
        userRole = userData.role
      } else {
        // Clear malformed cookie
        const response = NextResponse.next()
        response.cookies.delete("selly-user")
        return response
      }
    } catch (error) {
      const response = NextResponse.next()
      response.cookies.delete("selly-user")
      return response
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/"]

  // Protected routes that require authentication
  const protectedRoutes = ["/lookup", "/lists", "/staff", "/admin", "/reports", "/imports", "/exports"]

  // Staff-only routes
  const staffRoutes = ["/staff", "/admin", "/reports", "/imports", "/exports"]

  // If accessing a protected route without authentication, redirect to home
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (staffRoutes.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    if (userRole !== "staff" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
