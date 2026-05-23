import type { Metadata } from "next";
import ResourcesSplashScreen, {
  RESOURCES_SPLASH_DURATION_MS,
  RESOURCES_SPLASH_STORAGE_KEY,
} from "@/components/resources/splash-screen";
import { HakoTable } from "@/components/resources/hako-table";
import { SplashGate } from "@/components/common/splash-gate";

const title = "Tài Nguyên - Đọc Light Novel miễn phí";
const description = "Tổng hợp tài nguyên Light Novel miễn phí.";

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

export default function ResourcesPage() {
  return (
    <SplashGate
      splash={<ResourcesSplashScreen />}
      storageKey={RESOURCES_SPLASH_STORAGE_KEY}
      durationMs={RESOURCES_SPLASH_DURATION_MS}
    >
      <HakoTable />
    </SplashGate>
  );
}
