"use client";

import { createContext, useContext, useMemo } from "react";

interface AdminShellValue {
  /** Opens the sidebar drawer. Mobile only — on lg+ the sidebar is always visible. */
  openSidebar: () => void;
}

const AdminShellContext = createContext<AdminShellValue>({ openSidebar: () => {} });

/** Lets page headers reach the layout's sidebar toggle without prop drilling. */
export function AdminShellProvider({ openSidebar, children }: AdminShellValue & { children: React.ReactNode }) {
  const value = useMemo(() => ({ openSidebar }), [openSidebar]);
  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  return useContext(AdminShellContext);
}
