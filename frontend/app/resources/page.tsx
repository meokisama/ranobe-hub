import type { Metadata } from "next";
import ResourcesSplashScreen from "@/components/resources/splash-screen";
import { HakoTable } from "@/components/resources/hako-table";

const title = "Tài Nguyên - Light Novel Hub";
const description = "Tổng hợp tài nguyên Light Novel: danh sách Hako và các nguồn đọc Light Novel hữu ích khác.";

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
      <HakoTable />
    </>
  );
}
