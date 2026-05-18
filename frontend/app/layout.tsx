import type { Metadata } from "next";
import { Lexend, Poppins, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/common/site-header";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["vietnamese"],
});

const jaro = localFont({
  weight: "400",
  src: "./Jaro.ttf",
  variable: "--font-jaro",
  display: "swap",
});

const playfair_display = Playfair_Display({
  subsets: ["vietnamese"],
  variable: "--font-playfair_display",
  display: "swap",
});

const poppins = Poppins({
  weight: "900",
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const title = "Light Novel Hub - Thư viện Light Novel miễn phí";
const description = "Đọc Light Novel miễn phí. Chia sẻ bộ sưu tập KonoRano và tổng hợp tài nguyên Light Novel miễn phí.";

export const metadata: Metadata = {
  title: title,
  description: description,
  creator: "Meoki",
  publisher: "Meoki",
  keywords: [
    "light novel",
    "đọc light novel",
    "thư viện light novel",
    "ln",
    "ranobe",
    "ranobe reader",
    "blog",
    "tiểu thuyết",
    "light novel blog",
    "light novel epub",
    "epub raw",
    "light novel raw",
  ],
  metadataBase: new URL("https://hub.ranobe.vn"),
  openGraph: {
    title: title,
    description: description,
    siteName: title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lexend.variable} ${jaro.variable} ${playfair_display.variable} ${poppins.variable} antialiased`}>
        <SiteHeader />
        {children}
        <Toaster richColors />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4 as string} />
    </html>
  );
}
