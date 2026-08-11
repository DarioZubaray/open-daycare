"use client";

import { useState } from "react";
import type { Child } from "@/lib/children";

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChild: (child: Child) => void;
}

const ROOMS = ["Soles", "Lunas", "Estrellas"] as const;

export function AddChildModal({ isOpen, onClose, onAddChild }: AddChildModalProps) {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [room, setRoom] = useState<string>(ROOMS[0]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string; birthDate?: string }>({});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-6 pt-10 pb-10">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-line bg-surface shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-[26px] py-5">
          <button
            onClick={onClose}
            className="text-[15px] font-bold text-subtle"
          >
            Cancelar
          </button>
          <span className="font-heading text-[18px] font-semibold text-ink">
            Agregar niño
          </span>
          <button
            onClick={() => {
              const newErrors: { fullName?: string; birthDate?: string } = {};
              if (!fullName.trim()) newErrors.fullName = "El nombre es obligatorio";
              if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) newErrors.birthDate = "Fecha inválida";
              setErrors(newErrors);
              if (Object.keys(newErrors).length > 0) return;

              console.log("Nuevo niño:", { fullName, birthDate, room, allergies, medicalNotes });

              const id = fullName
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

              const now = new Date();
          const joinDate = `${["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][now.getMonth()]} ${now.getFullYear()}`;

              onAddChild({
                id,
                name: fullName.trim(),
                age: "0 años",
                room,
                initial: fullName.trim().charAt(0).toUpperCase(),
                avatarBg: "#E8D5C4",
                avatarColor: "#8B7355",
                parents: [],
                birthDate,
                joinDate,
                allergies,
                allergyNotes: medicalNotes || undefined,
              });

              setFullName("");
              setBirthDate("");
              setRoom(ROOMS[0]);
              setAllergies([]);
              setAllergyInput("");
              setMedicalNotes("");
              setErrors({});
              onClose();
            }}
            className="text-[15px] font-extrabold text-accent"
          >
            Guardar
          </button>
        </div>

        {/* Body */}
        <div className="px-[26px] py-6">
          {/* Nombre completo */}
          <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-subtle">
            NOMBRE COMPLETO
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ej. Martina López"
            className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-line bg-white px-4 py-[13px] text-[15px] text-ink placeholder:text-muted"
          />
          {errors.fullName && (
            <p className="-mt-4 mb-[18px] text-[13px] text-accent">{errors.fullName}</p>
          )}

          {/* Fecha + Sala */}
          <div className="mb-[18px] flex gap-[14px]">
            <div className="flex-1">
              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-subtle">
                FECHA DE NACIMIENTO
              </label>
              <input
                value={birthDate}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                  let formatted = digits;
                  if (digits.length > 2) formatted = digits.slice(0, 2) + "/" + digits.slice(2);
                  if (digits.length > 4) formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
                  setBirthDate(formatted);
                }}
                placeholder="dd/mm/aaaa"
                className="w-full rounded-[14px] border-[1.5px] border-line bg-white px-4 py-[13px] text-[15px] text-ink placeholder:text-muted"
              />
              {errors.birthDate && (
                <p className="mt-1 text-[13px] text-accent">{errors.birthDate}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-subtle">
                SALA
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full appearance-none rounded-[14px] border-[1.5px] border-line bg-white px-4 py-[13px] text-[15px] font-bold text-ink"
              >
                {ROOMS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Alergias */}
          <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-subtle">
            ALERGIAS (ETIQUETAS)
          </label>
          <div className="mb-[18px] flex flex-wrap gap-2 rounded-[14px] border-[1.5px] border-line bg-white px-4 py-[13px]">
            {allergies.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-[#FBD8CC] px-3 py-1 text-[13px] font-semibold text-[#D9684A]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setAllergies(allergies.filter((a) => a !== tag))}
                  className="ml-0.5 text-[#D9684A]"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "," || e.key === "Enter") {
                  e.preventDefault();
                  const tag = allergyInput.trim();
                  if (tag && !allergies.includes(tag)) {
                    setAllergies([...allergies, tag]);
                  }
                  setAllergyInput("");
                }
              }}
              placeholder={allergies.length === 0 ? "Ej. Maní, Lactosa" : ""}
              className="min-w-[120px] flex-1 border-none bg-transparent text-[15px] text-ink placeholder:text-muted"
            />
          </div>

          {/* Notas médicas */}
          <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-subtle">
            NOTAS MÉDICAS
          </label>
          <textarea
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            placeholder="Indicaciones, medicación, contactos…"
            rows={3}
            className="w-full resize-vertical rounded-[14px] border-[1.5px] border-line bg-white px-4 py-[13px] text-[15px] text-ink leading-[1.5] placeholder:text-muted"
          />
        </div>
      </div>
    </div>
  );
}
