"use client";

import { useState, useTransition } from "react";
import { reaccionarMensaje } from "@/app/mensajes/reaccionar";
import { EMOJIS_REACCION, type EmojiReaccion } from "@/lib/validation";

type Props = {
  mensajeId: string;
  counts: Record<string, number>;
  misReacciones: Record<string, boolean>;
};

export function ReaccionesBar({ mensajeId, counts, misReacciones }: Props) {
  const [optimistic, setOptimistic] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Record<string, boolean>>(misReacciones);
  const [pending, startTransition] = useTransition();

  function reaccionar(emoji: EmojiReaccion) {
    if (mine[emoji] || pending) return;
    setOptimistic((o) => ({ ...o, [emoji]: (o[emoji] ?? 0) + 1 }));
    setMine((m) => ({ ...m, [emoji]: true }));
    startTransition(async () => {
      const res = await reaccionarMensaje(mensajeId, emoji);
      if (!res.ok) {
        setOptimistic((o) => ({ ...o, [emoji]: (o[emoji] ?? 1) - 1 }));
        setMine((m) => ({ ...m, [emoji]: false }));
      }
    });
  }

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {EMOJIS_REACCION.map((emoji) => {
        const total = (counts[emoji] ?? 0) + (optimistic[emoji] ?? 0);
        const yo = mine[emoji];
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => reaccionar(emoji)}
            disabled={yo || pending}
            aria-label={`Reaccionar con ${emoji}`}
            aria-pressed={yo}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition-colors ${
              yo
                ? "border-rose-200 bg-rose-50 text-rose-700 cursor-default"
                : "border-stone-200 bg-white text-stone-700 hover:border-rose-200 hover:bg-rose-50"
            }`}
          >
            <span aria-hidden>{emoji}</span>
            {total > 0 && (
              <span className="text-xs font-semibold tabular-nums">
                {total}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
