"use client";

import { SidebarShell } from "@/components/SidebarShell";

export default function KidsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarShell />
      {children}
    </div>
  );
}
