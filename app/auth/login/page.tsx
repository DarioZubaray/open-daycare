"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/AuthLayout";

function SunIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("caro@opendaycare.com");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setErrors({ email: emailErr, password: passwordErr });
    setSubmitted(true);
    if (!emailErr && !passwordErr) {
      router.push("/");
    }
  }

  function handleFieldBlur(field: "email" | "password") {
    if (!submitted) return;
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  }

  return (
    <AuthLayout>
      <div className="grid min-h-0 w-full max-w-[1080px] grid-cols-[1.05fr_1fr] overflow-hidden rounded-[24px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]" style={{ minHeight: "calc(100vh - 80px)" }}>
        {/* Left panel — gradient */}
        <div className="relative flex flex-col justify-between overflow-hidden px-14 py-14 text-white" style={{ background: "linear-gradient(155deg, #F6A98E 0%, #F2937A 45%, #EC7E62 100%)" }}>
          <div className="absolute -right-[120px] -top-[140px] h-[420px] w-[420px] rounded-full bg-white/12" />
          <div className="absolute -bottom-[110px] -left-[80px] h-[300px] w-[300px] rounded-full bg-white/10" />

          <div className="relative flex items-center gap-[13px]">
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-white/22">
              <SunIcon />
            </div>
            <span className="font-heading text-[21px] font-semibold tracking-[0.5px]">OpenDayCare</span>
          </div>

          <div className="relative">
            <h1 className="font-heading text-[42px] font-semibold leading-[1.12]">
              El día de cada niño,
              <br />
              compartido con su familia.
            </h1>
            <p className="mt-[18px] max-w-[430px] text-[17px] leading-[1.6] text-white/92">
              Publicá momentos, gestioná las salas y mantené a las familias cerca, desde un solo lugar.
            </p>
          </div>

          <div className="relative text-[14px] text-white/90">🌿 Guardería Sala Soles</div>
        </div>

        {/* Right panel — form */}
        <div className="flex items-center justify-center bg-[#FBF4EC] px-10 py-10">
          <div className="w-full max-w-[392px]">
            <h2 className="font-heading text-[30px] font-semibold text-ink">Iniciar sesión</h2>
            <p className="mb-7 mt-1 text-[15px] text-subtle">Ingresá para ver el día de hoy.</p>

            <form onSubmit={handleSubmit} noValidate>
              <label className="mb-2 block text-[12px] font-bold tracking-[0.7px] text-subtle">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleFieldBlur("email")}
                className="mb-1 w-full rounded-[14px] border-[1.5px] border-line bg-white px-4 py-[14px] text-[15px] text-ink outline-none placeholder:text-[#B6A99B]"
              />
              {errors.email && <p className="mb-4 text-[13px] text-accent">{errors.email}</p>}
              {!errors.email && <div className="mb-4" />}

              <label className="mb-2 block text-[12px] font-bold tracking-[0.7px] text-subtle">CONTRASEÑA</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleFieldBlur("password")}
                className="mb-2 w-full rounded-[14px] border-[1.5px] border-line bg-white px-4 py-[14px] text-[15px] text-ink outline-none placeholder:text-[#B6A99B]"
              />
              {errors.password && <p className="mb-2 text-[13px] text-accent">{errors.password}</p>}
              <div className="mb-5 text-right">
                <span className="cursor-pointer text-[13.5px] font-bold text-accent">¿Olvidaste tu contraseña?</span>
              </div>

              <button
                type="submit"
                className="mb-6 w-full cursor-pointer rounded-[15px] bg-linear-to-b from-primary-from to-primary-to py-[15px] text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
              >
                Iniciar sesión
              </button>
            </form>

            <p className="text-center text-[14.5px] text-subtle">
              ¿Te invitó la guardería?{" "}
              <Link href="/auth/activar-cuenta" className="font-extrabold text-accent">
                Activá tu cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
