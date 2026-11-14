import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Fraunces, JetBrains_Mono, Shippori_Mincho } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/site";
import "./globals.css";

// Body copy, site and admin alike. Designed for Vietnamese, so stacked diacritics sit properly.
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  weight: ["300", "400", "500", "600"],
  subsets: ["vietnamese"],
  display: "swap",
});

// Latin/Vietnamese display.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["vietnamese"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

// Japanese titles. Kanji arrive in unicode-range slices, only the ones a page uses.
const shippori = Shippori_Mincho({
  variable: "--font-shippori",
  weight: ["500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Labels, numerals, catalogue marks.
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  subsets: ["vietnamese"],
  display: "swap",
});

const title = "Ranobe Hub — Thư viện Light Novel miễn phí";
const description = "Đọc Light Novel tiếng Nhật miễn phí ngay trên trình duyệt. Bộ sưu tập KonoRano và kho tài nguyên Light Novel.";

export const metadata: Metadata = {
  title,
  description,
  creator: "Meoki",
  publisher: "Meoki",
  keywords: [
    "light novel",
    "đọc light novel",
    "thư viện light novel",
    "ln",
    "ranobe",
    "ranobe reader",
    "tiểu thuyết",
    "light novel epub",
    "epub raw",
    "light novel raw",
  ],
  metadataBase: new URL(SITE.url),
  openGraph: {
    title,
    description,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#f3eee4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnam.variable} ${fraunces.variable} ${shippori.variable} ${jetbrains.variable} antialiased`}>
        {children}
        <Toaster richColors />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4 as string} />
    </html>
  );
}
