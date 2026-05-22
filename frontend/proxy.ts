import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua route /admin/login
  if (pathname === "/admin/login") {
    // Nếu đã có token hợp lệ, chuyển hướng về /admin
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

  // Lấy token từ cookie
  const token = request.cookies.get("adminToken")?.value;
  const tokenExpires = request.cookies.get("adminTokenExpires")?.value;

  // Kiểm tra token và thời gian hết hạn
  if (!token || !tokenExpires) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Kiểm tra thời gian hết hạn
  const expiresDate = new Date(tokenExpires);
  if (expiresDate < new Date()) {
    // Xóa cookie khi token hết hạn
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("adminToken");
    response.cookies.delete("adminTokenExpires");
    return response;
  }

  // Thêm token vào header cho các request đến /admin
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-token", token);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Chỉ chạy middleware cho /admin
export const config = {
  matcher: ["/admin/:path*"],
};
