import type { Metadata } from "next";
import { AozoraLanding } from "@/components/aozora/aozora-landing";

const title = "Aozora ㅡ 青空 • Trình đọc EPUB cho người học tiếng Nhật";
const description =
  "Aozora là trình đọc EPUB dành cho người học tiếng Nhật: tra từ Yomitan, tạo thẻ Anki, giọng đọc waifu (TTS), furigana, đọc dọc và thống kê đọc sách. Có bản Web và Desktop.";

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
