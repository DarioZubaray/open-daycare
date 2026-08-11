"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/AuthLayout";

function SunIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function validateInvitationCode(code: string): string | undefined {
  if (!code.trim()) return "El código de invitación es obligatorio.";
  return undefined;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "El email es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Ingresá un email válido.";
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return "La contraseña es obligatoria.";
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
  return undefined;
}

export default function ActivateAccountPage() {
  const router = useRouter();
  const [invitationCode, setInvitationCode] = useState("7K4P9");
  const [email, setEmail] = useState("lucia.fernandez@gmail.com");
  const [password, setPassword] = useState("");
  const [authorizePhotos, setAuthorizePhotos] = useState(false);
  const [errors, setErrors] = useState<{ invitationCode?: string; email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const codeErr = validateInvitationCode(invitationCode);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setErrors({ invitationCode: codeErr, email: emailErr, password: passwordErr });
    setSubmitted(true);
    if (!codeErr && !emailErr && !passwordErr) {
      router.push("/");
    }
  }

  function handleFieldBlur(field: "invitationCode" | "email" | "password") {
    if (!submitted) return;
    if (field === "invitationCode") {
      setErrors((prev) => ({ ...prev, invitationCode: validateInvitationCode(invitationCode) }));
    } else if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[440px]">
        <div className="mb-[22px] flex h-[58px] w-[58px] items-center justify-center rounded-[18px] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]" style={{ background: "linear-gradient(155deg, #F8C3A8, #F2937A)" }}>
          <SunIcon />
        </div>
        <h1 className="font-heading text-[32px] font-semibold leading-[1.15] text-ink">Bienvenida a OpenDayCare</h1>
        <p className="mb-[26px] mt-2 text-[15.5px] leading-[1.55] text-subtle">
          Te invitaron a seguir el día de tu hijo. Creá tu contraseña para activar la cuenta.
        </p>

        {/* Invitation card */}
        <div className="mb-[22px] flex items-center gap-[14px] rounded-[16px] border-[1.5px] border-line bg-white p-[14px_16px]">
          <div className="flex h-[44px] w-[44px] flex-none items-center justify-center rounded-full bg-[#A9D9E8] font-heading text-[19px] font-semibold text-[#1F7A93]">
            M
          </div>
          <div>
            <div className="text-[13px] text-subtle">Te invitaron a seguir a</div>
            <div className="font-heading text-[17px] font-semibold text-ink">Mateo · Sala Soles</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label className="mb-2 block text-[12px] font-bold tracking-[0.7px] text-subtle">CÓDIGO DE INVITACIÓN</label>
          <input
            type="text"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value)}
            onBlur={() => handleFieldBlur("invitationCode")}
            className="mb-1 w-full rounded-[14px] border-[1.5px] border-line bg-white px-4 py-[14px] font-heading text-[18px] font-bold tracking-[3px] text-ink outline-none"
          />
          {errors.invitationCode && <p className="mb-4 text-[13px] text-accent">{errors.invitationCode}</p>}
          {!errors.invitationCode && <div className="mb-4" />}

          <label className="mb-2 block text-[12px] font-bold tracking-[0.7px] text-subtle">EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleFieldBlur("email")}
            className="mb-1 w-full rounded-[14px] border-[1.5px] border-line bg-white px-4 py-[14px] text-[15px] text-ink outline-none"
          />
          {errors.email && <p className="mb-4 text-[13px] text-accent">{errors.email}</p>}
          {!errors.email && <div className="mb-4" />}

          <label className="mb-2 block text-[12px] font-bold tracking-[0.7px] text-subtle">CREAR CONTRASEÑA</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleFieldBlur("password")}
            className="mb-1 w-full rounded-[14px] border-[1.5px] border-[#F2A78E] bg-white px-4 py-[14px] text-[15px] text-ink outline-none"
          />
          {errors.password && <p className="mb-4 text-[13px] text-accent">{errors.password}</p>}
          {!errors.password && <div className="mb-4" />}

          {/* Photo authorization checkbox */}
          <label className="mb-6 flex cursor-pointer items-start gap-[12px] rounded-[14px] bg-[#FBF1D6] p-[14px_16px]">
            <input
              type="checkbox"
              checked={authorizePhotos}
              onChange={(e) => setAuthorizePhotos(e.target.checked)}
              className="sr-only"
            />
            <span className={`mt-px flex h-[24px] w-[24px] flex-none items-center justify-center rounded-[8px] ${authorizePhotos ? "bg-[#5FB97E]" : "bg-[#5FB97E]/60"}`}>
              {authorizePhotos && <CheckIcon />}
            </span>
            <span className="text-[14px] leading-[1.45] text-[#8A7234]">
              Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro de la app.
            </span>
          </label>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-[15px] bg-linear-to-b from-primary-from to-primary-to py-[15px] text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
          >
            Activar mi cuenta
          </button>
        </form>

        <p className="mt-[22px] text-center text-[14.5px] text-subtle">
          ¿Ya tenés cuenta?{" "}
          <Link href="/auth/login" className="font-extrabold text-accent">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
