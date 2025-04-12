import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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

const title = "Ranobe Reader | Meoki";
const description =
  "Trình đọc Light Novel gốc Nhật dưới dạng sách điện tử được chia sẻ từ Meoki.";

export const metadata: Metadata = {
  title: title,
  description: description,
  creator: "Meoki",
  publisher: "Meoki",
  keywords: [
    "light novel",
    "ln",
    "ranobe",
    "blog",
    "tiểu thuyết",
    "light novel blog",
    "ranobe epub reader",
    "epub raw",
    "ranobe raw",
    "ranobe vn",
    "ranobe vn raw",
    "ranobe vn raw reader",
  ],
  metadataBase: new URL("https://ranobe.vn"),
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
      <body className={`${lexend.variable} ${jaro.variable} antialiased`}>
        {children}
        <Toaster richColors />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4 as string} />
    </html>
  );
}
