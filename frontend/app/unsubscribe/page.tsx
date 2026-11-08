"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Notice } from "@/components/site/notice";
import { UNSUBSCRIBE_URL } from "@/lib/site";

type Status = "loading" | "success" | "error";

function UnsubscribeContent() {
  const token = useSearchParams().get("token");
  const [result, setResult] = useState<{ status: Status; message: string }>({ status: "loading", message: "" });

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = async () => {
      try {
        if (!token) throw new Error("Token không hợp lệ");
        const response = await fetch(`${UNSUBSCRIBE_URL}?token=${encodeURIComponent(token)}`);
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.msg || body.message || "Có lỗi xảy ra");
        if (!cancelled) setResult({ status: "success", message: "" });
      } catch (error) {
        if (!cancelled) setResult({ status: "error", message: error instanceof Error ? error.message : "Có lỗi xảy ra" });
      }
    };

    void unsubscribe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (result.status === "loading") return <Pending />;

  if (result.status === "success") {
    return (
      <Notice
        kanji="了"
        label="Hủy đăng ký"
        title={
          <>
            Đã hủy <em className="font-light italic">đăng ký</em>
          </>
        }
        homeLink
      >
        Bạn sẽ không nhận được email từ Ranobe Hub nữa. Kệ sách vẫn luôn mở cửa nếu bạn muốn ghé lại.
      </Notice>
    );
  }

  return (
    <Notice
      kanji="誤"
      label="Hủy đăng ký"
      title={
        <>
          Chưa hủy <em className="font-light italic">được</em>
        </>
      }
      homeLink
    >
      {result.message}. Hãy thử mở lại liên kết trong email.
    </Notice>
  );
}

function Pending() {
  return (
    <Notice kanji="待" label="Hủy đăng ký" title="Đang xử lý…">
      Chờ một chút nhé.
    </Notice>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<Pending />}>
      <UnsubscribeContent />
    </Suspense>
  );
}
