"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import {
  liberarReserva,
  reservarItem,
} from "@/app/reservar/actions";
import type { ActionState } from "@/app/mensajes/actions";

type Props = {
  itemId: string;
  itemNombre: string;
  estado: string;
  isMine: boolean;
};

export function ReservarControl({ itemId, itemNombre, estado, isMine }: Props) {
  // Oculto para estados finales o reservas ajenas.
  if (estado === "ya_lo_tenemos" || estado === "recibido") return null;
  if (estado === "reservado" && !isMine) return null;
  if (estado === "reservado" && isMine) {
    return <BotonLiberar itemId={itemId} />;
  }
  // disponible
  return <BotonReservar itemId={itemId} itemNombre={itemNombre} />;
}

/* ---------------- Reservar ---------------- */

function PendienteSubmit({ labelIdle, labelPending }: { labelIdle: string; labelPending: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 transition-colors"
    >
      {pending ? labelPending : labelIdle}
    </button>
  );
}

function BotonReservar({ itemId, itemNombre }: { itemId: string; itemNombre: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction] = useActionState<ActionState, FormData>(
    reservarItem,
    null,
  );

  useEffect(() => {
    if (state?.ok) dialogRef.current?.close();
  }, [state]);

  const errors = state && !state.ok ? state.errors : {};
  const values = state && !state.ok ? state.values : undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="self-start mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-1.5 transition-colors"
      >
        Lo regalo yo
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-2xl p-0 w-[min(100%,420px)] backdrop:bg-stone-900/40"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <form action={formAction} className="flex flex-col gap-4 p-5" noValidate>
          <header>
            <h3 className="text-lg font-semibold text-stone-900">
              Vas a regalar
            </h3>
            <p className="text-sm text-stone-600">{itemNombre}</p>
          </header>

          <input type="hidden" name="itemId" value={itemId} />

          {errors._ && (
            <p className="rounded-md bg-rose-50 text-rose-700 text-sm px-3 py-2">
              {errors._}
            </p>
          )}

          <div>
            <label
              htmlFor={`nombre-${itemId}`}
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Tu nombre
            </label>
            <input
              id={`nombre-${itemId}`}
              name="nombre"
              type="text"
              required
              minLength={2}
              maxLength={60}
              defaultValue={values?.nombre}
              placeholder="Ej. Ana María"
              className={clsx(
                "w-full rounded-md border px-3 py-2 text-sm bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400",
                errors.nombre ? "border-rose-400" : "border-stone-200",
              )}
              aria-invalid={errors.nombre ? "true" : undefined}
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-rose-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label
              htmlFor={`msg-${itemId}`}
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Mensaje para Tatiana y Julián (opcional)
            </label>
            <textarea
              id={`msg-${itemId}`}
              name="mensajeOpcional"
              rows={2}
              maxLength={300}
              defaultValue={values?.mensajeOpcional}
              placeholder="Ej. Lo traigo envuelto en azul"
              className={clsx(
                "w-full rounded-md border px-3 py-2 text-sm bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none",
                errors.mensajeOpcional ? "border-rose-400" : "border-stone-200",
              )}
            />
            {errors.mensajeOpcional && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.mensajeOpcional}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="text-sm text-stone-600 hover:text-stone-900 px-3 py-2"
            >
              Cancelar
            </button>
            <PendienteSubmit labelIdle="Confirmar reserva" labelPending="Reservando..." />
          </div>
        </form>
      </dialog>
    </>
  );
}

/* ---------------- Liberar ---------------- */

function BotonLiberar({ itemId }: { itemId: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    liberarReserva,
    null,
  );
  const errors = state && !state.ok ? state.errors : {};

  return (
    <div className="mt-1 flex flex-col gap-1.5 items-start">
      <p className="text-xs text-emerald-700 font-medium">
        ✓ Tú lo vas a regalar
      </p>
      <form
        action={formAction}
        onSubmit={(e) => {
          if (!confirm("¿Confirmas que ya no podrás regalarlo?")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="itemId" value={itemId} />
        <button
          type="submit"
          className="text-xs text-rose-600 hover:underline"
        >
          Ya no podré regalarlo
        </button>
      </form>
      {errors._ && <p className="text-xs text-rose-600">{errors._}</p>}
    </div>
  );
}
