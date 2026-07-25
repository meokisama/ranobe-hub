"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminShell } from "./admin-shell";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  /** Primary page action, e.g. the "Thêm ..." button. Rendered on the right. */
  action?: React.ReactNode;
}

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  const { openSidebar } = useAdminShell();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="outline" size="icon" onClick={openSidebar} className="shrink-0 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
