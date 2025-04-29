import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    // Check if the current path is an auth route
    const isAuthRoute =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register");

    // If no access token
    if (!accessToken) {
      // If trying to access protected route, redirect to login
      if (!isAuthRoute) {
        const redirectUrl = `/login?redirect=${encodeURIComponent(
          req.nextUrl.toString()
        )}`;
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
      // If on auth route, allow access
      return NextResponse.next();
    }

    // Verify the token with Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If token is invalid or user not found
    if (error || !user) {
      // If trying to access protected route, redirect to login
      if (!isAuthRoute) {
        const redirectUrl = `/login?redirect=${encodeURIComponent(
          req.nextUrl.toString()
        )}`;
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
      // If on auth route, allow access
      return NextResponse.next();
    }

    // If authenticated and on auth route, redirect to dashboard
    if (isAuthRoute) {
      const redirectParam = new URL(req.nextUrl.toString()).searchParams.get(
        "redirect"
      );
      return NextResponse.redirect(new URL(redirectParam || "/", req.url));
    }

    // Token is valid and not on auth route, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, redirect to login if not on auth route
    if (
      !req.nextUrl.pathname.startsWith("/login") &&
      !req.nextUrl.pathname.startsWith("/register")
    ) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(
        req.nextUrl.toString()
      )}`;
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth API endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
