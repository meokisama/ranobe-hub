import { Suspense } from "react";
import type { Metadata } from "next";
import ResourcesSplashScreen from "@/components/resources/splash-screen";
import { HakoTable } from "@/components/resources/hako-table";

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
    <>
      <ResourcesSplashScreen />
      <Suspense fallback={null}>
        <HakoTable />
      </Suspense>
    </>
  );
}
