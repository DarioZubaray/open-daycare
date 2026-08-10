"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function SunIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function ChildrenIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

const NAV_ITEMS: Array<{ label: string; icon: ReactNode; href: string; active?: boolean }> = [
  { label: "Feed", icon: <HomeIcon />, href: "/" },
  { label: "Niños", icon: <ChildrenIcon />, href: "/kids" },
  { label: "Avisos", icon: <BellIcon />, href: "#" },
  { label: "Mi cuenta", icon: <UserIcon />, href: "#" },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-30 bg-ink/30 sidebar:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-line bg-surface px-4 py-6 transition-transform duration-200 sidebar:sticky sidebar:top-0 sidebar:h-screen sidebar:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/" className="flex items-center gap-[11px] px-2 pb-[22px] pt-1">
          <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-[linear-gradient(155deg,#F8C3A8,#F2937A)]">
            <SunIcon />
          </div>
          <div>
            <div className="font-heading text-[17px] font-semibold leading-none text-ink">OpenDayCare</div>
            <div className="mt-0.5 text-[11.5px] text-muted">Sala Soles</div>
          </div>
        </Link>

        <a
          href="#"
          className="mb-[18px] flex w-full items-center justify-center gap-2 rounded-[14px] bg-linear-to-b from-primary-from to-primary-to px-3 py-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
        >
          <PlusIcon />
          Nueva publicación
        </a>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href !== "#" && pathname === item.href;
            const className = `flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] ${
              isActive
                ? "bg-[#FBE3D8] font-extrabold text-[#D9583C]"
                : "font-semibold text-[#6E6359]"
            }`;

            return item.href === "#" ? (
              <a key={item.label} href="#" className={className}>
                {item.icon}
                {item.label}
              </a>
            ) : (
              <Link key={item.label} href={item.href} className={className}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-2.5 border-t border-line pt-3.5">
          <div className="flex items-center gap-[11px] px-2 py-1.5">
            <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-[#F2937A] font-heading text-base font-semibold text-white">
              C
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-extrabold text-ink">Caro Giménez</div>
              <div className="text-xs text-muted">Maestra · Soles</div>
            </div>
            <a href="#" title="Cerrar sesión" className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-cream text-subtle">
              <LogoutIcon />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
