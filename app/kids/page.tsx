"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChildCard } from "@/components/ChildCard";
import { AddChildModal } from "@/components/AddChildModal";
import type { ChildWithRoom } from "@/lib/types";

function PlusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0A290" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function KidsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kidsList, setKidsList] = useState<ChildWithRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("children")
      .select("*, rooms(name)")
      .eq("status", "active")
      .order("full_name");
    if (data) setKidsList(data as ChildWithRoom[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleChildAdded = useCallback(() => {
    fetchChildren();
  }, [fetchChildren]);

  return (
    <main className="h-screen min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[880px] px-10 pb-20 pt-[34px]">
        <div className="mb-[22px] flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-accent">
              GESTIÓN
            </p>
            <h1 className="m-0 font-heading text-[30px] font-semibold text-ink">
              Niños
            </h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-[14px] bg-linear-to-b from-primary-from to-primary-to px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
          >
            <PlusIcon />
            Agregar niño
          </button>
        </div>

        <div className="mb-[22px] flex items-center gap-[11px] rounded-[14px] border border-line bg-surface px-4 py-3">
          <SearchIcon />
          <input
            placeholder="Buscar niño…"
            className="flex-1 border-none bg-transparent text-[15px] text-ink placeholder:text-muted"
          />
        </div>

        <div className="mb-[14px] flex items-center gap-3">
          <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-ink">
            SALA SOLES
          </span>
          <span className="text-[13px] text-muted">
            {loading ? "Cargando…" : `${kidsList.length} niños`}
          </span>
          <span className="h-px flex-1 bg-[#E7DAC8]" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-[14px]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-[18px] border border-line bg-surface" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[14px]">
            {kidsList.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </div>

      <AddChildModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onChildAdded={handleChildAdded}
      />
    </main>
  );
}
