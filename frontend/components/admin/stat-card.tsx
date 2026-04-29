import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  accent?: "default" | "blue" | "amber" | "emerald";
}

const accentMap: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "bg-primary/10 text-primary",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function StatCard({ label, value, hint, icon, accent = "default" }: StatCardProps) {
  return (
    <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div
          className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105", accentMap[accent])}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
