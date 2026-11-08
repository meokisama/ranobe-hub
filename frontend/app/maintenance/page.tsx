import type { Metadata } from "next";
import { Notice } from "@/components/site/notice";

export const metadata: Metadata = {
  title: "Đang bảo trì — Ranobe Hub",
  robots: { index: false },
};

export default function MaintenancePage() {
  return (
    <Notice
      kanji="工事中"
      label="Bảo trì"
      title={
        <>
          Kệ sách đang được <em className="font-light italic">sắp xếp lại</em>
        </>
      }
    >
      Ranobe Hub tạm đóng cửa để bảo trì. Bạn quay lại sau ít phút nhé.
    </Notice>
  );
}
