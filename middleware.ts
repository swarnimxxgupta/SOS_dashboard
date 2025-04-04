import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    // Get the pathname of the request
    const path = request.nextUrl.pathname

    // Define public paths that don't require authentication
    const isPublicPath = path === "/"

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const isAuthenticated = !!session

    // Redirect authenticated users from public paths to dashboard
    if (isPublicPath && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Redirect unauthenticated users to login page
    if (!isPublicPath && !isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Allow the request to continue
    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error, allow the request to continue
    // This will let the page handle the error appropriately
    return NextResponse.next()
  }
}

// See "Matching Paths" below to learn more
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

