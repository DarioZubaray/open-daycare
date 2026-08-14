"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { ChildWithRoom } from "@/lib/types";
import { getChildAvatar, getChildInitial } from "@/lib/types";

const POST_TYPES = [
  { id: "comida", label: "Comida", bg: "#9A7B1E", color: "#fff" },
  { id: "siesta", label: "Siesta", bg: "#E7DCF6", color: "#7B5FC0" },
  { id: "actividad", label: "Actividad", bg: "#2E89A6", color: "#fff" },
  { id: "logro", label: "Logro", bg: "#CFEBD8", color: "#3E9B6C" },
  { id: "animo", label: "Ánimo", bg: "#F9D2DE", color: "#C56486" },
  { id: "foto", label: "Foto", bg: "#FBD8CC", color: "#D9684A" },
  { id: "anuncio", label: "Anuncio", bg: "#CCD8F4", color: "#4E72C8" },
];

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dbChildren, setDbChildren] = useState<ChildWithRoom[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const supabase = createClient();
    supabase
      .from("children")
      .select("*, rooms(name)")
      .eq("status", "active")
      .order("full_name")
      .then(({ data }) => {
        if (data) setDbChildren(data as ChildWithRoom[]);
      });
  }, [isOpen]);

  const resetForm = useCallback(() => {
    setSelectedChildren([]);
    setSelectedTypes([]);
    setDescription("");
    setPhotos([]);
    setPhotoError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const isDisabled =
    selectedChildren.length === 0 ||
    selectedTypes.length === 0 ||
    (description.trim() === "" && photos.length === 0);

  const handleChildToggle = useCallback((childId: string) => {
    setSelectedChildren((prev) => {
      if (prev.includes(childId)) {
        return prev.filter((id) => id !== childId);
      }
      return [...prev.filter((id) => id !== "all"), childId];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedChildren((prev) =>
      prev.includes("all") ? [] : ["all"]
    );
  }, []);

  const handleTypeToggle = useCallback((typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  }, []);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setPhotoError(null);
    const newPhotos: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        setPhotoError("Solo se permiten archivos de imagen.");
        continue;
      }
      newPhotos.push(file);
    }
    if (newPhotos.length > 0) {
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handlePublish = useCallback(() => {
    if (isDisabled) return;
    console.log("Nueva publicación:", {
      children: selectedChildren.includes("all")
        ? dbChildren.map((c) => c.id)
        : selectedChildren,
      types: selectedTypes,
      description,
      photos: photos.map((p) => p.name),
    });
    resetForm();
    onClose();
  }, [
    isDisabled,
    selectedChildren,
    selectedTypes,
    description,
    photos,
    resetForm,
    onClose,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-6 pt-10">
      <div className="w-full max-w-[580px] overflow-hidden rounded-3xl border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]">
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <button onClick={handleClose} className="font-bold text-[#94887B]">
            Cancelar
          </button>
          <span className="font-heading text-lg font-semibold text-[#3F362E]">
            Nueva publicación
          </span>
          <button
            onClick={handlePublish}
            disabled={isDisabled}
            className={`font-extrabold text-[#D9583C] ${
              isDisabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            Publicar
          </button>
        </div>

        <div className="px-[26px] py-6">
          <div className="mb-2.5 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            PARA
          </div>
          <div className="mb-6 flex flex-wrap gap-[9px]">
            {dbChildren.map((child) => {
              const { avatarBg, avatarColor } = getChildAvatar(child.id);
              const initial = getChildInitial(child.full_name);
              const isSelected =
                selectedChildren.includes(child.id) ||
                selectedChildren.includes("all");
              return (
                <button
                  key={child.id}
                  onClick={() => handleChildToggle(child.id)}
                  className={`flex items-center gap-2 rounded-full border-[1.5px] px-3.5 py-[6px] text-[14px] font-bold ${
                    isSelected
                      ? "border-[#3F362E] bg-[#3F362E] text-white"
                      : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                  }`}
                >
                  <span
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full font-heading text-[13px] font-semibold"
                    style={{
                      background: avatarBg,
                      color: avatarColor,
                    }}
                  >
                    {initial}
                  </span>
                  {child.full_name.split(" ")[0]}
                </button>
              );
            })}
            <button
              onClick={handleSelectAll}
              className={`rounded-full border-[1.5px] px-4 py-[6px] text-[14px] font-bold ${
                selectedChildren.includes("all")
                  ? "border-[#3F362E] bg-[#3F362E] text-white"
                  : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
              }`}
            >
              Toda la sala
            </button>
          </div>

          <div className="mb-2.5 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            TIPO
          </div>
          <div className="mb-6 flex flex-wrap gap-[9px]">
            {POST_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type.id);
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeToggle(type.id)}
                  className="rounded-full px-4 py-2 text-[13.5px] font-extrabold"
                  style={{
                    background: isSelected ? type.bg : "#FFFDF9",
                    color: isSelected ? type.color : "#6E6359",
                    border: isSelected ? "none" : "1.5px solid #ECE0D0",
                  }}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          <div className="mb-2.5 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            DESCRIPCIÓN
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contá cómo le fue hoy…"
            className="mb-6 w-full resize-vertical rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-3.5 text-[15px] leading-[1.5] text-[#3F362E] placeholder:text-[#B6A99B]"
            style={{ minHeight: 120 }}
          />

          <div className="mb-2.5 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
            FOTOS
          </div>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex gap-3"
          >
            {photos.map((file, i) => (
              <div
                key={i}
                className="relative h-24 w-24 flex-none overflow-hidden rounded-[14px] border border-[#ECE0D0]"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() =>
                    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] text-white"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-24 w-24 flex-none cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C5503A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-xs">Agregar</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
          {photoError && (
            <p className="mt-2 text-xs font-bold text-[#D9583C]">
              {photoError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
