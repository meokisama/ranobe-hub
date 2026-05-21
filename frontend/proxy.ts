import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chế độ bảo trì: rewrite mọi route (kể cả /admin) về /maintenance.
  if (process.env.MAINTENANCE_MODE === "true" && !pathname.startsWith("/maintenance")) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url, { status: 503 });
  }

  // Kiểm tra nếu đang truy cập route /admin
  if (pathname.startsWith("/admin")) {
    // Bỏ qua route /admin/login
    if (request.nextUrl.pathname === "/admin/login") {
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

  return NextResponse.next();
}

// Áp dụng middleware cho mọi route (trừ static assets), để vừa gate /admin
// vừa có thể bật chế độ bảo trì cho cả site công khai.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
