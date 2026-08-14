"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { ChildWithRoom, LinkedParent } from "@/lib/types";
import { getChildAvatar, getChildInitial, getChildAge, getChildBadge, formatDateBirth, formatDateEnrolled } from "@/lib/types";
import { LinkParentModal } from "@/components/LinkParentModal";

const ROLE_LABELS: Record<string, string> = {
  mother: "Mamá",
  father: "Papá",
  guardian: "Tutor/a",
};

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function KidProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parentsList, setParentsList] = useState<LinkedParent[]>([]);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [child, setChild] = useState<ChildWithRoom | null>(null);
  const [loading, setLoading] = useState(true);

  useState(() => {
    params.then((p) => setResolvedParams(p));
  });

  useEffect(() => {
    if (!resolvedParams) return;
    const supabase = createClient();
    supabase
      .from("children")
      .select("*, rooms(name)")
      .eq("id", resolvedParams.id)
      .single()
      .then(({ data }) => {
        setChild(data as ChildWithRoom | null);
        setLoading(false);
      });
  }, [resolvedParams]);

  function handleAddParent(parent: LinkedParent) {
    setParentsList((prev) => [...prev, parent]);
  }

  if (loading) {
    return (
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] px-10 pb-20 pt-[34px]">
          <div className="h-[20px] w-[160px] animate-pulse rounded bg-line" />
          <div className="mt-6 h-[84px] w-[300px] animate-pulse rounded-2xl bg-line" />
        </div>
      </main>
    );
  }

  if (!child) {
    return (
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] px-10 pb-20 pt-[34px]">
          <Link
            href="/kids"
            className="mb-5 flex items-center gap-[7px] text-subtle font-bold text-[14px]"
          >
            <ArrowLeftIcon />
            Volver a Niños
          </Link>
          <p className="text-[15px] text-subtle">Niño no encontrado.</p>
        </div>
      </main>
    );
  }

  const { avatarBg, avatarColor } = getChildAvatar(child.id);
  const initial = getChildInitial(child.full_name);
  const age = getChildAge(child.birth_date);
  const badge = getChildBadge(child.allergy_tags);
  const roomName = child.rooms?.name ?? "—";
  const birthDateFormatted = formatDateBirth(child.birth_date);
  const enrolledFormatted = formatDateEnrolled(child.enrolled_at);

  return (
    <main className="h-screen min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[820px] px-10 pb-20 pt-[34px]">
        <Link
          href="/kids"
          className="mb-5 flex items-center gap-[7px] text-subtle font-bold text-[14px]"
        >
          <ArrowLeftIcon />
          Volver a Niños
        </Link>

        <div className="flex gap-[26px] flex-wrap items-start">
          <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
            <div className="flex items-center gap-[18px]">
              <div
                className="flex h-[84px] w-[84px] flex-none items-center justify-center rounded-full font-heading text-[34px] font-semibold"
                style={{ background: avatarBg, color: avatarColor }}
              >
                {initial}
              </div>
              <div className="flex-1">
                <h1 className="m-0 font-heading text-[28px] font-semibold text-ink">
                  {child.full_name}
                </h1>
                <p className="mt-[3px] text-[15px] text-subtle">
                  {age} · Sala {roomName}
                </p>
              </div>
              {badge && (
                <span
                  className="flex-none rounded-full px-[9px] py-[5px] text-[11px] font-extrabold"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              )}
              <a
                href="#"
                className="flex-none rounded-xl border-[1.5px] border-line bg-surface px-4 py-[9px] text-[14px] font-bold text-[#6E6359]"
              >
                Editar
              </a>
            </div>

            {child.medical_notes ? (
              <div className="flex gap-[14px] rounded-2xl bg-[#FBDAD6] p-[18px]">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-[#F4A8A0]">
                  <AlertIcon />
                </div>
                <div>
                  <div className="mb-0.5 text-[15px] font-extrabold text-[#C5413A]">
                    Alergias y notas
                  </div>
                  <div className="text-[14.5px] leading-[1.5] text-[#B25249]">
                    {child.medical_notes}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
                <span className="text-[14.5px] text-subtle">Fecha de nacimiento</span>
                <span className="text-[14.5px] font-extrabold text-ink">{birthDateFormatted}</span>
              </div>
              <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
                <span className="text-[14.5px] text-subtle">Sala</span>
                <span className="text-[14.5px] font-extrabold text-ink">{roomName}</span>
              </div>
              <div className="flex justify-between px-[18px] py-[15px]">
                <span className="text-[14.5px] text-subtle">Ingreso</span>
                <span className="text-[14.5px] font-extrabold text-ink">{enrolledFormatted}</span>
              </div>
            </div>
          </div>

          <div className="flex w-[300px] flex-none flex-col gap-[14px]">
            <a
              href="#"
              className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-ink py-[13px] text-[15px] font-extrabold text-white"
            >
              <SunIcon />
              Resumen del día
            </a>

            <div className="rounded-2xl border border-line bg-surface p-[18px]">
              <div className="mb-[14px] text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
                PADRES VINCULADOS
              </div>
              <div className="flex flex-col gap-[14px]">
                {parentsList.map((parent) => (
                  <div key={parent.name} className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-heading text-base font-semibold text-white"
                      style={{ background: parent.avatarBg }}
                    >
                      {parent.initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14.5px] font-extrabold text-ink">
                        {parent.name}
                      </div>
                      <div className="text-[12.5px] text-muted">
                        {ROLE_LABELS[parent.role] ?? parent.role} ·{" "}
                        {parent.status === "active" ? "activa" : "invitación enviada"}
                      </div>
                    </div>
                    <span
                      className="flex-none rounded-full px-[9px] py-1 text-[10.5px] font-extrabold"
                      style={{
                        background: parent.status === "active" ? "#CFEBD8" : "#F7E7A6",
                        color: parent.status === "active" ? "#3E9B6C" : "#9A7B1E",
                      }}
                    >
                      {parent.status === "active" ? "ACTIVA" : "PENDIENTE"}
                    </span>
                  </div>
                ))}

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-3 pt-2"
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-[#B0A290]">
                    <PlusIcon />
                  </span>
                  <span className="text-[14.5px] font-extrabold text-accent">
                    Vincular otro padre
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LinkParentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        childName={child.full_name}
        onAddParent={handleAddParent}
      />
    </main>
  );
}
