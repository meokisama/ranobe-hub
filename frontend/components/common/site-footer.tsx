"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hidesSiteChrome } from "./chrome-routes";

export function SiteFooter() {
  const pathname = usePathname();

  if (hidesSiteChrome(pathname)) return null;

  return (
    <footer className="relative w-full bg-gradient-to-b from-[#fffbfb] to-orange-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent from-10% via-orange-300/70 to-transparent to-90%" />

      <div className="relative mx-auto max-w-screen-xl px-4 py-3 md:px-6">
        <p className="text-center text-sm font-light text-gray-500">
          Góp ý, báo lỗi hoặc liên hệ qua{" "}
          <Link href="https://facebook.com/TheMeoki" target="_blank" className="font-medium text-orange-700 transition-colors hover:text-orange-800">
            Facebook
          </Link>{" "}
          hoặc gửi mail tới{" "}
          <Link href="mailto:hi@meoki.vn" className="font-medium text-orange-700 transition-colors hover:text-orange-800">
            hi@meoki.vn
          </Link>
        </p>
      </div>
    </footer>
  );
}
