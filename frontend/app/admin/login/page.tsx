"use client";

import Image from "next/image";
import { LoginForm } from "@/components/admin/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin if already logged in
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    const token = getCookie("adminToken");
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Glow background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 size-96 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 size-96 rounded-full bg-rose-300/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md overflow-hidden border-orange-100/80 bg-white/70 shadow-xl shadow-orange-200/30 backdrop-blur-md dark:border-orange-900/40 dark:bg-background/60">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />

        <div className="flex flex-col items-center gap-3 px-8 pt-10 text-center">
          <Image
            src="/header-icon.png"
            alt="Ranobe Hub"
            width={672}
            height={606}
            priority
            className="h-20 w-auto drop-shadow-[0_10px_25px_rgba(249,115,22,0.35)]"
          />
          <Image src="/header-text.png" alt="ranobe hub" width={906} height={233} priority className="h-10 w-auto" />
        </div>

        <CardContent className="px-8 pb-10 pt-8">
          <LoginForm />
        </CardContent>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent" />
      </Card>
    </div>
  );
}
