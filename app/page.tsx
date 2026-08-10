"use client";

import { useState } from "react";
import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { feedPosts } from "@/lib/posts";

function formatToday(): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}

function CameraIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function Home() {
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
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
          <header className="mb-6">
            <p className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
              GUARDERÍA · SALA SOLES
            </p>
            <h1 className="m-0 font-heading text-[30px] font-semibold text-ink">Buenas, Caro</h1>
            <p className="mt-[5px] text-[14.5px] text-subtle">12 niños · {formatToday()}</p>
          </header>

          <a
            href="#"
            className="mb-6 flex items-center gap-[14px] rounded-[18px] border border-line bg-surface px-[18px] py-[14px] shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]"
          >
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#F2937A] font-heading text-base font-semibold text-white">
              C
            </div>
            <span className="flex-1 text-[15px] text-muted">Compartí un momento…</span>
            <span className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#FBE3D8] text-[#E0654A]">
              <CameraIcon />
            </span>
          </a>

          <div className="mb-[14px] flex items-center gap-[14px]">
            <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
              PUBLICADO HOY
            </span>
            <span className="h-px flex-1 bg-[#E7DAC8]" />
          </div>

          <div className="flex flex-col gap-4">
            {feedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
