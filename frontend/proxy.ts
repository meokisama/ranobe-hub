import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip the /admin/login route
  if (pathname === "/admin/login") {
    // Redirect to /admin if already authenticated
    const token = request.cookies.get("adminToken")?.value;
    const tokenExpires = request.cookies.get("adminTokenExpires")?.value;

    if (token && tokenExpires) {
      const expiresDate = new Date(tokenExpires);
      if (expiresDate > new Date()) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("adminToken")?.value;
  const tokenExpires = request.cookies.get("adminTokenExpires")?.value;

  if (!token || !tokenExpires) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const expiresDate = new Date(tokenExpires);
  if (expiresDate < new Date()) {
    // Clear cookies once the token has expired
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("adminToken");
    response.cookies.delete("adminTokenExpires");
    return response;
  }

  // Forward the token in a header for /admin requests
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-token", token);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Only run middleware for /admin
export const config = {
  matcher: ["/admin/:path*"],
};
