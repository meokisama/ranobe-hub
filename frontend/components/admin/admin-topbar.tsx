"use client";
import { Menu, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/60 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          asChild
          className="hidden cursor-pointer transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 md:inline-flex dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
        >
          <Link href="/" target="_blank">
            <ExternalLink className="h-4 w-4" />
            Trang chủ
          </Link>
        </Button>
      </div>
    </header>
  );
}
