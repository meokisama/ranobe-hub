"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SITE, SUBSCRIBE_URL } from "@/lib/site";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Epilogue() {
  return (
    <section id="letters" className="relative scroll-mt-16 overflow-hidden bg-paper-deep py-24 lg:py-40">
      <div className="relative mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-14">
        <SectionHeading
          mark="参"
          label="Thư từ"
          title={
            <>
              Còn thiếu <em className="font-light italic">cuốn nào?</em>
            </>
          }
        >
          Nhắn mình để yêu cầu tác phẩm khác, hoặc để lại email — mỗi khi có sách mới lên kệ, bạn sẽ là người biết đầu tiên.
        </SectionHeading>

        <div className="mt-12 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-7">
            <Postcard />
          </Reveal>

          <div className="flex flex-col gap-10 lg:col-span-5 lg:gap-12">
            <Reveal delay={0.08}>
              <h3 className="font-display text-3xl tracking-[-0.02em] text-sumi lg:text-[2.4rem]">Yêu cầu tác phẩm khác</h3>
              <p className="mt-4 max-w-md text-[15px] font-light leading-[1.75] text-sumi-soft">
                Nhắn tin trực tiếp cho mình kèm tên cuốn bạn muốn đọc. Còn nếu thích đọc những bài phân tích về light novel, ghé blog Ranobe.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-sumi">
                <a href={SITE.facebook} target="_blank" rel="noopener" className="link-sweep inline-flex items-center gap-1.5">
                  Nhắn tin qua Facebook
                  <ArrowUpRight className="size-4" strokeWidth={1.75} />
                </a>
                <a href={SITE.blog} target="_blank" rel="noopener" className="link-sweep inline-flex items-center gap-1.5">
                  Blog Ranobe.vn
                  <ArrowUpRight className="size-4" strokeWidth={1.75} />
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.14} className="border-l-2 border-shu pl-5 lg:pl-7">
              <p className="flex items-center gap-3 font-label text-[10.5px] uppercase tracking-[0.26em] text-sumi-soft">
                <span lang="ja" className="font-mincho text-sm font-bold tracking-[0.1em] text-shu">
                  追記
                </span>
                Về chuyên mục tạp chí
              </p>
              <div className="mt-4 space-y-3 text-sm font-light leading-[1.8] text-sumi-soft">
                <p>
                  Thị trường tạp chí light novel suy thoái nhanh chóng từ những năm 2010: <b className="font-medium text-sumi">The Sneaker</b> ngừng phát hành năm
                  2011, <b className="font-medium text-sumi">Dengeki Bunko Magazine</b> dừng lại năm 2020. Và <b className="font-medium text-sumi">Dragon Magazine</b>,
                  tạp chí cuối cùng còn sót lại, cũng khép lại với số phát hành tháng 05/2025, ngay sau kỷ niệm 35 năm.
                </p>
                <p>
                  Để kỷ niệm sự kiện này, chuyên mục chia sẻ tạp chí cũng xin dừng tại đây.{" "}
                  <s className="text-sumi-mute">Khụ, chứ không phải do mỗi cuốn nặng gần 100MB, bằng 10 cuốn light novel, server hết lưu nổi đâu.</s>
                </p>
              </div>
              <Link href="/resources" className="link-sweep mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-sumi">
                Thay vào đó, tới bộ sưu tập Hako
                <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Newsletter sign-up, set as the address side of a postcard. */
function Postcard() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      toast.error("Email không hợp lệ", { description: "Vui lòng nhập đúng định dạng email." });
      return;
    }
    try {
      setStatus("loading");
      const response = await fetch(SUBSCRIBE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.msg || "Có lỗi xảy ra");
      setStatus("done");
      setEmail("");
      toast.success("Đăng ký thành công", { description: "Bạn sẽ nhận được thông báo mỗi khi có sách mới được đăng tải.", duration: 5000 });
    } catch (error) {
      setStatus("idle");
      toast.error("Có lỗi xảy ra", { description: error instanceof Error ? error.message : "Vui lòng thử lại sau.", duration: 5000 });
    }
  };

  return (
    <div className="postcard relative bg-paper p-6 sm:p-9 lg:p-12">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.4em] text-sumi-mute">Post card</p>
          <p lang="ja" className="mt-1 font-mincho text-sm font-bold tracking-[0.5em] text-sumi">
            郵便はがき
          </p>
        </div>
        {/* Stamp */}
        <div aria-hidden className="stamp grid h-[5.5rem] w-[4.5rem] shrink-0 rotate-3 place-items-center bg-shu text-paper sm:h-24 sm:w-20">
          <div className="text-center">
            <p lang="ja" className="font-mincho text-2xl font-extrabold leading-none">
              新刊
            </p>
            <p className="mt-1.5 font-label text-[8px] uppercase tracking-[0.2em] text-paper/80">Ranobe Hub</p>
          </div>
        </div>
      </div>

      <h3 className="mt-8 font-display text-[2.6rem] leading-[0.98] tracking-[-0.03em] text-sumi sm:text-6xl lg:mt-10">
        Ngại vì <em className="font-light italic text-shu">sống chậm!?</em>
      </h3>
      <p className="mt-5 max-w-lg text-[15px] font-light leading-[1.75] text-sumi-soft">
        Xấu hổ với bạn bè vì sống chậm? Tự ti vì web này có sách mới cũng không biết? Đăng ký để nhận thông báo ngay khi mình đăng tải sách mới.
      </p>

      <form onSubmit={submit} noValidate className="mt-9 lg:mt-12">
        <label htmlFor="subscribe-email" className="font-label text-[10px] uppercase tracking-[0.28em] text-sumi-mute">
          Gửi tới
        </label>
        <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end">
          <input
            id="subscribe-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@ranobe.vn"
            className="h-12 w-full min-w-0 flex-1 border-b border-sumi/40 bg-transparent font-display text-xl italic text-sumi outline-none transition-colors placeholder:text-sumi-mute/70 focus:border-shu sm:text-2xl"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="group inline-flex h-12 shrink-0 items-center justify-between gap-4 rounded-full bg-sumi pl-6 pr-2 text-sm font-medium text-paper transition-colors duration-300 hover:bg-shu disabled:opacity-60"
          >
            {status === "loading" ? "Đang gửi…" : status === "done" ? "Đã đăng ký" : "Đăng ký"}
            <span className="grid size-8 place-items-center rounded-full bg-paper text-sumi transition-transform duration-500 group-hover:translate-x-0.5">
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </span>
          </button>
        </div>
        <p className="mt-4 text-xs font-light text-sumi-mute">Chỉ gửi khi có sách mới. Hủy đăng ký bất cứ lúc nào bằng liên kết trong email.</p>
      </form>
    </div>
  );
}
