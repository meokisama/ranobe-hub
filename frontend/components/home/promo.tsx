import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircleIcon, HomeIcon } from "lucide-react";
export const Promo = () => {
  return (
    <div className="px-4">
      <div className="border border-orange-300 rounded-lg md:rounded-xl relative max-w-screen-xl mx-auto flex flex-col md:flex-row items-center gap-4 backdrop-blur my-20 shadow-lg md:shadow-xl shadow-orange-300/30">
        <div className="absolute inset-0">
          <div className="absolute inset-0 -z-1 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [&>div]:absolute [&>div]:left-0 [&>div]:right-0 [&>div]:top-0 [&>div]:-z-10 [&>div]:m-auto [&>div]:h-[310px] [&>div]:w-[310px] [&>div]:rounded-full [&>div]:bg-fuchsia-400 [&>div]:opacity-20 [&>div]:blur-[100px]"></div>
        </div>
        <div className="flex-none p-4 text-center md:pl-12 md:text-left z-10 relative">
          <h2 className="text-2xl font-bold">
            Đọc những bài phân tích chất lượng?
          </h2>
          <p className="text-gray-400 font-light mt-2">
            Hoặc muốn yêu cầu cho tập truyện raw không có trong danh sách dưới
            đây?
          </p>
          <div className="flex gap-2 z-10 mt-8 justify-center md:justify-start">
            <Link href="https://ranobe.vn" target="_blank">
              <Button className="cursor-pointer font-semibold text-orange-50 bg-orange-800 hover:bg-orange-900 shadow-lg shadow-orange-800/40">
                <HomeIcon className="w-4 h-4" />
                Trang Chủ Ranobe
              </Button>
            </Link>
            <Link href="https://facebook.com/TheMeoki" target="_blank">
              <Button variant="outline" className="cursor-pointer font-light">
                <MessageCircleIcon className="w-4 h-4" />
                Nhắn Tin
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-auto flex justify-end">
          <Image
            src="/uwu.png"
            alt="sneaker"
            width={536}
            height={391}
            className="h-auto"
          />
        </div>
      </div>
    </div>
  );
};
