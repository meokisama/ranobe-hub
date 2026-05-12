import ResourcesSplashScreen from "@/components/resources/splash-screen";
import { HakoTable } from "@/components/resources/hako-table";

export default function ResourcesPage() {
  return (
    <div>
      <ResourcesSplashScreen />
      <div className="min-h-screen bg-[#fffbfb]">
        <HakoTable />
      </div>
    </div>
  );
}
