"use client";

import { useState } from "react";
import type { LinkedParent } from "@/lib/children";

interface LinkParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  onAddParent: (parent: LinkedParent) => void;
}

const ROLES = [
  { value: "mother" as const, label: "Mamá" },
  { value: "father" as const, label: "Papá" },
  { value: "guardian" as const, label: "Tutor/a" },
] as const;

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function LinkParentModal({
  isOpen,
  onClose,
  childName,
  onAddParent,
}: LinkParentModalProps) {
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"mother" | "father" | "guardian">("mother");
  const [submitted, setSubmitted] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const [errors, setErrors] = useState<{
    parentName?: string;
    email?: string;
  }>({});

  if (!isOpen) return null;

  function reset() {
    setParentName("");
    setEmail("");
    setRole("mother");
    setSubmitted(false);
    setInvitationCode("");
    setErrors({});
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { parentName?: string; email?: string } = {};

    if (!parentName.trim()) {
      newErrors.parentName = "El nombre es obligatorio";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email inválido";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const code = generateCode();
    setInvitationCode(code);
    setSubmitted(true);

    onAddParent({
      name: parentName.trim(),
      role,
      status: "pending",
      avatarBg: "#D8CBBA",
      avatarColor: "#8A7C6D",
      initial: parentName.trim().charAt(0).toUpperCase(),
      invitationCode: code,
    });
  }

  function handleRoleChange(newRole: "mother" | "father" | "guardian") {
    setRole(newRole);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-6 pt-10 pb-10"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[480px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <div>
            <div className="font-heading text-[18px] font-semibold text-[#3F362E]">
              Vincular padre
            </div>
            <div className="text-[13px] text-[#A89A8B]">a {childName}</div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#F0E6D8] text-[#94887B]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-[26px] pt-[22px] pb-[22px]">
          {/* Info box — only visible post-submit */}
          {submitted && (
            <div className="mb-5 flex gap-[11px] rounded-[14px] bg-[#E3ECFB] px-4 py-[13px]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4E72C8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-px flex-none"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
                Le enviaremos un correo con un código para que active su cuenta.
                Solo verá el feed de {childName}.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Parent name */}
            <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
              NOMBRE DEL PADRE/MADRE
            </div>
            <input
              placeholder="Ej. Diego Fernández"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              disabled={submitted}
              className="mb-2 w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] disabled:opacity-50"
            />
            {errors.parentName && (
              <div className="mb-4 text-[13px] text-[#C5413A]">
                {errors.parentName}
              </div>
            )}
            {!errors.parentName && <div className="mb-[18px]" />}

            {/* Email */}
            <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
              EMAIL
            </div>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitted}
              className="mb-2 w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] disabled:opacity-50"
            />
            {errors.email && (
              <div className="mb-4 text-[13px] text-[#C5413A]">
                {errors.email}
              </div>
            )}
            {!errors.email && <div className="mb-[18px]" />}

            {/* Parent role */}
            <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
              PARENTESCO
            </div>
            <div className="mb-5 flex gap-[9px]">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleRoleChange(r.value)}
                  disabled={submitted}
                  className="flex-1 rounded-full border-[1.5px] px-3 py-[11px] text-[14px] font-extrabold disabled:cursor-not-allowed"
                  style={{
                    borderColor:
                      role === r.value ? "#9FB8EC" : "#ECE0D0",
                    backgroundColor:
                      role === r.value ? "#CCD8F4" : "#FFFDF9",
                    color: role === r.value ? "#4E72C8" : "#6E6359",
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Invitation code — only visible post-submit */}
            {submitted && (
              <div
                className="mb-5 rounded-2xl border-[1.5px] border-dashed border-[#E6D08A] bg-[#FBF1D6] p-[18px] text-center"
              >
                <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#A88526]">
                  CÓDIGO DE INVITACIÓN
                </div>
                <div className="font-heading text-[34px] font-semibold tracking-[7px] text-[#8A7234]">
                  {invitationCode}
                </div>
                <div className="mt-1.5 text-[13px] text-[#A88526]">
                  Vence en 7 días
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitted}
              className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-gradient-to-b from-[#F4977E] to-[#EE8164] py-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,.7)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4z" />
                <path d="M22 2 11 13" />
              </svg>
              Enviar invitación
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
