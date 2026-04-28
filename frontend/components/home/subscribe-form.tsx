"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Image from "next/image";
const subscribeSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;

export default function SubscribeForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeSchema),
  });

  const onSubmit = async (data: SubscribeFormData) => {
    try {
      setStatus("loading");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscribers/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || "Có lỗi xảy ra");
      }

      setStatus("success");
      toast.success("Đăng ký thành công", {
        description: "Bạn sẽ nhận được thông báo mỗi khi có sách mới được đăng tải.",
        duration: 5000,
      });
      reset();
    } catch (error) {
      setStatus("error");
      toast.error("Có lỗi xảy ra", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau.",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    if (errors.email) {
      toast.error(errors.email.message, {
        description: "Vui lòng nhập đúng định dạng email.",
        duration: 5000,
      });
    }
  }, [errors.email]);

  return (
    <div className="relative backdrop-blur-xs overflow-hidden mt-12">
      <Image
        src="/sneaker.webp"
        alt="background image"
        width={1308}
        height={1000}
        className="absolute bottom-0 left-0 w-full h-auto -scale-x-100 -z-1 opacity-25 select-none pointer-events-none"
      />
      <section className="relative py-20 md:py-24 overflow-hidden">
        <div className="relative drop-shadow-xl z-100 -mt-20 md:-mt-24">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 100" width="100%">
            <path
              d="M 0 50 Q 32 50 64 75 Q 128 125 192 75 Q 224 50 256 50 Q 288 50 320 75 Q 384 125 448 75 Q 480 50 512 50 Q 544 50 576 75 Q 640 125 704 75 Q 736 50 768 50 Q 800 50 832 75 Q 896 125 960 75 Q 992 50 1024 50 Q 1056 50 1088 75 Q 1152 125 1216 75 Q 1248 50 1280 50 Q 1312 50 1344 75 Q 1408 125 1472 75 Q 1504 50 1536 50 L 1280 0 L 0 0 Z"
              fill="#fffbfb"
            ></path>
          </svg>
        </div>
        <Image
          className="absolute top-0 left-0 h-full w-full opacity-70 select-none pointer-events-none"
          src="/light-left-top-double.png"
          alt=""
          fill
        />
        <div className="relative container px-4 mx-auto inset-shadow-lg mt-20 md:mt-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap -mx-4 items-center">
              <div className="w-full lg:w-1/2 px-4 mb-16 lg:mb-0">
                <h4 className="font-heading text-4xl sm:text-5xl text-center lg:text-left font-black mb-6 text-[#434d63]">Ngại vì sống chậm!?</h4>
                <div className="relative z-10 max-w-lg text-center lg:text-left mx-auto lg:mx-0">
                  <div className="flex mb-16">
                    <div className="mb-6 md:mb-0 md:mr-8 pt-2">
                      <Image
                        src="/mamasuki-chibi.png"
                        alt=""
                        width={300}
                        height={100}
                        className="h-auto hidden md:block select-none pointer-events-none"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-lg font-light text-gray-400">
                        Xấu hổ với bạn bè vì sống chậm? Tự ti về bản thân vì web này có sách mới cũng không biết? Hãy đăng ký ngay để nhận thông báo
                        tức thì ngay khi tôi đăng tải sách mới 🎉
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)} className="sm:flex items-center">
                    <input
                      className="w-full mb-3 sm:mb-0 sm:mr-4 py-3 px-4 text-md text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-purple-500 focus:outline-purple rounded-lg bg-white font-light"
                      type="email"
                      placeholder="email@ranobe.vn"
                      {...register("email")}
                    />
                    <button
                      className="relative cursor-pointer group inline-block flex-shrink-0 w-full sm:w-auto py-3 px-5 text-sm font-semibold text-orange-50 bg-orange-700 hover:bg-orange-800 shadow-lg shadow-orange-800/40 rounded-md overflow-hidden"
                      type="submit"
                      disabled={status === "loading"}
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="mr-4">{status === "loading" ? "Đang xử lý..." : "Đăng ký"}</span>
                        <svg width="8" height="11" viewBox="0 0 8 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M6.82994 5.04001L2.58994 0.80001C2.49698 0.706281 2.38638 0.631887 2.26452 0.581118C2.14266 0.530349 2.01195 0.504211 1.87994 0.504211C1.74793 0.504211 1.61723 0.530349 1.49537 0.581118C1.37351 0.631887 1.26291 0.706281 1.16994 0.80001C0.983692 0.987372 0.87915 1.24082 0.87915 1.50501C0.87915 1.7692 0.983692 2.02265 1.16994 2.21001L4.70994 5.75001L1.16994 9.29001C0.983692 9.47737 0.87915 9.73082 0.87915 9.99501C0.87915 10.2592 0.983692 10.5126 1.16994 10.7C1.26338 10.7927 1.3742 10.866 1.49604 10.9158C1.61787 10.9655 1.74834 10.9908 1.87994 10.99C2.01155 10.9908 2.14201 10.9655 2.26385 10.9158C2.38569 10.866 2.4965 10.7927 2.58994 10.7L6.82994 6.46001C6.92367 6.36705 6.99806 6.25645 7.04883 6.13459C7.0996 6.01273 7.12574 5.88202 7.12574 5.75001C7.12574 5.618 7.0996 5.48729 7.04883 5.36543C6.99806 5.24357 6.92367 5.13297 6.82994 5.04001Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </div>
                    </button>
                  </form>
                </div>
              </div>
              <div className="w-full lg:w-1/2 px-4">
                <div className="relative pl-20 lg:pl-16 xl:pl-0 max-w-lg mx-auto">
                  <Image
                    className="absolute w-125 h-125 object-contain bottom-0 left-0 -mb-32 sm:-mb-0 -ml-8 xs:-ml-20 md:-ml-40 lg:-ml-24 xl:-ml-52 select-none pointer-events-none"
                    src="/circle-star-bg.png"
                    alt=""
                    fill
                  />
                  <Image
                    src="/sleeping_chibi.png"
                    alt=""
                    width={500}
                    height={500}
                    className="relative block h-auto w-full xl:max-w-sm lg:ml-auto select-none pointer-events-none drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
