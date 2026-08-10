import Link from "next/link";
import { notFound } from "next/navigation";
import { children } from "@/lib/children";

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

export default async function KidProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const child = children.find((c) => c.id === id);

  if (!child) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <main className="mx-auto h-screen min-w-0 w-full max-w-[820px] overflow-y-auto px-10 pb-20 pt-[34px]">
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
                style={{ background: child.avatarBg, color: child.avatarColor }}
              >
                {child.initial}
              </div>
              <div className="flex-1">
                <h1 className="m-0 font-heading text-[28px] font-semibold text-ink">
                  {child.name}
                </h1>
                <p className="mt-[3px] text-[15px] text-subtle">
                  {child.age} · Sala {child.room}
                </p>
              </div>
              <a
                href="#"
                className="flex-none rounded-xl border-[1.5px] border-line bg-surface px-4 py-[9px] text-[14px] font-bold text-[#6E6359]"
              >
                Editar
              </a>
            </div>

            {child.allergyNotes ? (
              <div className="flex gap-[14px] rounded-2xl bg-[#FBDAD6] p-[18px]">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-[#F4A8A0]">
                  <AlertIcon />
                </div>
                <div>
                  <div className="mb-0.5 text-[15px] font-extrabold text-[#C5413A]">
                    Alergias y notas
                  </div>
                  <div className="text-[14.5px] leading-[1.5] text-[#B25249]">
                    {child.allergyNotes}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
                <span className="text-[14.5px] text-subtle">Fecha de nacimiento</span>
                <span className="text-[14.5px] font-extrabold text-ink">{child.birthDate}</span>
              </div>
              <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
                <span className="text-[14.5px] text-subtle">Sala</span>
                <span className="text-[14.5px] font-extrabold text-ink">{child.room}</span>
              </div>
              <div className="flex justify-between px-[18px] py-[15px]">
                <span className="text-[14.5px] text-subtle">Ingreso</span>
                <span className="text-[14.5px] font-extrabold text-ink">{child.joinDate}</span>
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
                {child.parents.map((parent) => (
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
                        {parent.role} ·{" "}
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

                <a href="#" className="flex items-center gap-3 pt-2">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-[#B0A290]">
                    <PlusIcon />
                  </span>
                  <span className="text-[14.5px] font-extrabold text-accent">
                    Vincular otro padre
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
