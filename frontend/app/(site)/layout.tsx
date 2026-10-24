import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { MotionProvider } from "@/components/site/motion-provider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <div className="site">
        <a href="#main" className="skip-link">
          Bỏ qua điều hướng
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </div>
    </MotionProvider>
  );
}
