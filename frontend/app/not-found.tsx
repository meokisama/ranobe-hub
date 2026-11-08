import { Notice } from "@/components/site/notice";

export default function NotFound() {
  return (
    <Notice
      kanji="迷子"
      label="404"
      title={
        <>
          Lạc mất <em className="font-light italic">trang này</em> rồi
        </>
      }
      homeLink
    >
      Trang bạn tìm không có trên kệ, hoặc đã được chuyển đi nơi khác.
    </Notice>
  );
}
