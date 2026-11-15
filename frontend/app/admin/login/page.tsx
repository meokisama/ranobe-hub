import Image from "next/image";
import { LoginForm } from "@/components/admin/login-form";

// Redirecting an already-authenticated visitor to /admin is handled by proxy.ts.
export default function AdminLoginPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <span
        aria-hidden
        lang="ja"
        className="text-outline pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-mincho text-[62vw] font-extrabold leading-none text-foreground/[0.07] lg:text-[34rem]"
      >
        鍵
      </span>

      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <Image src="/header-icon.png" alt="" width={64} height={58} priority className="h-9 w-auto" />
          <span className="font-display text-2xl leading-none tracking-[-0.03em]">
            <span className="font-light italic">Ranobe</span> <span className="font-semibold">Hub</span>
          </span>
        </div>

        <p className="mt-12 flex items-center gap-3 font-label text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-shu" />
          Khu vực quản trị
        </p>
        <h1 className="mt-4 font-display text-6xl leading-[0.95] tracking-[-0.035em]">
          Đăng <em className="font-light italic">nhập</em>
        </h1>

        <div className="mt-10">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
