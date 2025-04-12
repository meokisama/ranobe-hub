import { CoverCarousel } from "@/components/home/covers-carousel";
import { EbookGrid } from "@/components/home/ebook-grid";
import { Promo } from "@/components/home/promo";
import Image from "next/image";
import SplashScreen from "@/components/home/splash-screen";
import SubscriberForm from "@/components/home/subscribe-form";

export default function HomePage() {
  return (
    <div>
      <SplashScreen />
      <div className="space-y-6 bg-[#fffbfb]">
        {/* <Image
          src="/sneaker.webp"
          alt="background image"
          width={1308}
          height={1000}
          className="fixed w-full h-auto -z-1 opacity-70 dark:hidden select-none pointer-events-none"
        />
        <Image
          src="/beams.jpg"
          alt="background image"
          width={1308}
          height={1000}
          className="fixed w-full h-full -z-1 opacity-40 dark:invert dark:hidden select-none pointer-events-none"
        /> */}
        <CoverCarousel />
        <Promo />
        <EbookGrid />
        <SubscriberForm />
      </div>
    </div>
  );
}
