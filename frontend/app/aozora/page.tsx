import type { Metadata } from "next";
import { AozoraLanding } from "@/components/aozora/aozora-landing";

const title = "Aozora 青空 ㅡ Trình đọc EPUB cho người học tiếng Nhật";
const description =
  "Aozora là trình đọc EPUB dành cho người học tiếng Nhật với từ điển Yomitan tích hợp, tạo Anki flashcard, giọng đọc waifu và rất nhiều tính năng khác.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function AozoraPage() {
  return <AozoraLanding />;
}
