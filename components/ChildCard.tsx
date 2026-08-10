import Link from "next/link";
import type { Child } from "@/lib/children";

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CBB89F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ChildCard({ child }: { child: Child }) {
  const parentCount = child.parents.length;
  const parentLabel =
    parentCount === 0
      ? "sin padres vinculados"
      : parentCount === 1
        ? "1 padre vinculado"
        : `${parentCount} padres vinculados`;

  return (
    <Link
      href={`/kids/${child.id}`}
      className="kid flex min-w-0 items-center gap-[14px] rounded-[18px] border border-line bg-surface px-4 py-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)]"
    >
      <div
        className="flex h-12 w-12 flex-none items-center justify-center rounded-full font-heading text-[19px] font-semibold"
        style={{ background: child.avatarBg, color: child.avatarColor }}
      >
        {child.initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-heading text-[16px] font-semibold text-ink">
          {child.name}
        </div>
        <div className="text-[13px] text-muted">
          {child.age} · {parentLabel}
        </div>
      </div>
      {child.badge ? (
        <span
          className="flex-none rounded-full px-[9px] py-[5px] text-[11px] font-extrabold"
          style={{ background: child.badge.bg, color: child.badge.color }}
        >
          {child.badge.label}
        </span>
      ) : (
        <ChevronIcon />
      )}
    </Link>
  );
}
