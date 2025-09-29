import { CoverCarousel } from "@/components/home/covers-carousel";
import { EbookGrid } from "@/components/home/ebook-grid";
import { KonoranoGrid } from "@/components/home/konorano-grid";
import { MagazineGrid } from "@/components/home/magazine-grid";
import { Promo } from "@/components/home/promo";
import SplashScreen from "@/components/home/splash-screen";
import SubscriberForm from "@/components/home/subscribe-form";

export default function HomePage() {
  return (
    <div>
      <SplashScreen />
      <div className="bg-[#fffbfb]">
        <CoverCarousel />
        <Promo />
        <EbookGrid />
        <KonoranoGrid />
        <MagazineGrid />
        <SubscriberForm />
      </div>
    </div>
  );
}
