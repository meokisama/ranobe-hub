"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminShell } from "./admin-shell";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  /** Number of records, shown beside the title once loaded. */
  count?: number;
  /** Primary page action, e.g. the "Thêm ..." button. Rendered on the right. */
  action?: React.ReactNode;
}

export function AdminPageHeader({ title, description, count, action }: AdminPageHeaderProps) {
  const { openSidebar } = useAdminShell();

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-5">
      <div className="flex min-w-0 items-end gap-3">
        <Button variant="outline" size="icon" onClick={openSidebar} aria-label="Mở menu" className="mb-1 shrink-0 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          {description && <p className="truncate font-label text-[10.5px] uppercase tracking-[0.24em] text-muted-foreground">{description}</p>}
          <h1 className="mt-1.5 flex items-baseline gap-3 font-display text-4xl leading-none tracking-[-0.03em] md:text-5xl">
            <span className="truncate pb-1">{title}</span>
            {count !== undefined && (
              <span className="font-label text-sm tracking-normal tabular-nums text-muted-foreground">{count.toLocaleString("vi-VN")}</span>
            )}
          </h1>
        </div>
      </div>
      {action}
    </div>
  );
}
