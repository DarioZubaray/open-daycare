"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function KidsLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream">
      {!isSidebarOpen ? (
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir menú"
          className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)] sidebar:hidden"
        >
          <MenuIcon />
        </button>
      ) : null}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {children}
    </div>
  );
}
