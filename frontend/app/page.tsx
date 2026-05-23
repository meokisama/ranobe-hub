import { CoverCarousel } from "@/components/home/covers-carousel";
import { EbookGrid } from "@/components/home/ebook-grid";
import { KonoranoGrid } from "@/components/home/konorano-grid";
import { MagazineGrid } from "@/components/home/magazine-grid";
import { Promo } from "@/components/home/promo";
import SplashScreen, { HOME_SPLASH_DURATION_MS, HOME_SPLASH_STORAGE_KEY } from "@/components/home/splash-screen";
import SubscriberForm from "@/components/home/subscribe-form";
import { SplashGate } from "@/components/common/splash-gate";

export default function HomePage() {
  return (
    <SplashGate splash={<SplashScreen />} storageKey={HOME_SPLASH_STORAGE_KEY} durationMs={HOME_SPLASH_DURATION_MS}>
      <div className="bg-[#fffbfb]">
        <CoverCarousel />
        <Promo />
        <EbookGrid />
        <KonoranoGrid />
        <MagazineGrid />
        <SubscriberForm />
      </div>
    </SplashGate>
  );
}
