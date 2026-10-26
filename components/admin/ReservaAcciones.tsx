"use client";

import {
  cancelarReserva,
  marcarRecibida,
} from "@/app/admin/reservas/actions";

export function ReservaAcciones({ reservaId }: { reservaId: string }) {
  return (
    <div className="flex flex-col gap-1 items-end shrink-0">
      <form action={marcarRecibida}>
        <input type="hidden" name="id" value={reservaId} />
        <button
          type="submit"
          className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1"
        >
          Marcar recibido
        </button>
      </form>
      <form
        action={cancelarReserva}
        onSubmit={(e) => {
          if (
            !confirm(
              "Cancelar liberará el ítem para otros invitados. ¿Continuar?",
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={reservaId} />
        <button type="submit" className="text-xs text-rose-600 hover:underline">
          Cancelar
        </button>
      </form>
    </div>
  );
}
