import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js Edge Middleware
 * 1. Refreshes user session cookies using Supabase SSR.
 * 2. Protects internal Portal routes (/dashboard, /systems, /admin, etc.).
 * 3. Redirects authenticated users away from /login to /dashboard.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase keys are placeholder (e.g. before initial production setup),
  // allow developer preview without blocking.
  const isPlaceholder = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder");

  let user = null;

  if (!isPlaceholder) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Check current authenticated user safely from server
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  const isAuthRoute = pathname.startsWith("/login");
  const isProtectedRoute = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/systems") || 
    pathname.startsWith("/admin") ||
    pathname.startsWith("/settings");

  // Case 1: Unauthenticated user trying to access protected portal route
  if (!user && isProtectedRoute && !isPlaceholder) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Case 2: Authenticated user trying to access /login
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
