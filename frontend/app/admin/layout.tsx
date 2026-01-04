"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Xóa cookie khi đăng xuất
    document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    document.cookie = "adminTokenExpires=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    router.push("/admin/login");
  };

  // Không hiển thị layout cho trang login
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="flex h-16 w-full items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-xl">
              Admin Dashboard
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Ebooks
                </div>
              </Link>
              <Link
                href="/admin/konorano"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/admin/konorano" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Konorano
                </div>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:flex">
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
