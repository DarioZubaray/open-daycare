"use client";

import { useState } from "react";

export function Contador() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6 rounded-[20px] border border-line bg-surface px-10 py-8 shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <h2 className="font-heading text-[22px] font-semibold text-ink">
        Contador
      </h2>

      <span className="font-heading text-[56px] font-bold tabular-nums text-ink">
        {count}
      </span>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setCount((c) => c - 1)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-[22px] font-bold text-ink transition hover:bg-line"
        >
          −
        </button>

        <button
          onClick={() => setCount(0)}
          className="rounded-full bg-gradient-to-r from-primary-from to-primary-to px-6 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-90"
        >
          Reiniciar
        </button>

        <button
          onClick={() => setCount((c) => c + 1)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-[22px] font-bold text-ink transition hover:bg-line"
        >
          +
        </button>
      </div>
    </div>
  );
}
