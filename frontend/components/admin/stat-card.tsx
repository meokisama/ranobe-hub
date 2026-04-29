import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  accent?: "default" | "blue" | "amber" | "emerald";
}

const accentMap: Record<NonNullable<StatCardProps["accent"]>, { blob: string; icon: string; shadow: string }> = {
  default: {
    blob: "from-rose-200/70 to-pink-200/40 dark:from-rose-500/25 dark:to-pink-500/10",
    icon: "from-rose-400 to-pink-500",
    shadow: "hover:shadow-rose-200/60 dark:hover:shadow-rose-500/10",
  },
  blue: {
    blob: "from-sky-200/70 to-indigo-200/40 dark:from-sky-500/25 dark:to-indigo-500/10",
    icon: "from-sky-400 to-indigo-500",
    shadow: "hover:shadow-sky-200/60 dark:hover:shadow-sky-500/10",
  },
  amber: {
    blob: "from-amber-200/70 to-orange-200/40 dark:from-amber-500/25 dark:to-orange-500/10",
    icon: "from-amber-400 to-orange-500",
    shadow: "hover:shadow-amber-200/60 dark:hover:shadow-amber-500/10",
  },
  emerald: {
    blob: "from-emerald-200/70 to-teal-200/40 dark:from-emerald-500/25 dark:to-teal-500/10",
    icon: "from-emerald-400 to-teal-500",
    shadow: "hover:shadow-emerald-200/60 dark:hover:shadow-emerald-500/10",
  },
};

export function StatCard({ label, value, hint, icon, accent = "default" }: StatCardProps) {
  const styles = accentMap[accent];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        styles.shadow,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-all duration-500 group-hover:scale-110 group-hover:opacity-90",
          styles.blob,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-all duration-300 group-hover:rotate-6 group-hover:scale-110",
            styles.icon,
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
