"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Mensaje } from "@prisma/client";
import {
  editarMensaje,
  eliminarMensaje,
} from "@/app/admin/mensajes/actions";
import type { ActionState } from "@/app/mensajes/actions";

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-xs font-semibold px-3 py-1.5"
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}

export function MensajeAdminRow({ mensaje }: { mensaje: Mensaje }) {
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState<ActionState, FormData>(
    editarMensaje,
    null,
  );

  useEffect(() => {
    if (state?.ok) setEditing(false);
  }, [state]);

  const errors = state && !state.ok ? state.errors : {};

  return (
    <li className="rounded-xl border border-amber-100 bg-white p-4">
      {!editing ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="whitespace-pre-wrap text-sm text-stone-800">
              {mensaje.texto}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              <span className="font-semibold text-stone-700">
                {mensaje.nombreAutor}
              </span>{" "}
              ·{" "}
              {formatDistanceToNow(mensaje.createdAt, {
                locale: es,
                addSuffix: true,
              })}
            </p>
          </div>
          <div className="flex flex-col gap-1 items-end shrink-0">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-stone-600 hover:text-stone-900"
            >
              Editar
            </button>
            <form
              action={eliminarMensaje}
              onSubmit={(e) => {
                if (!confirm("¿Eliminar este mensaje?")) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={mensaje.id} />
              <button type="submit" className="text-xs text-rose-600 hover:underline">
                Eliminar
              </button>
            </form>
          </div>
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-3" noValidate>
          <input type="hidden" name="id" value={mensaje.id} />
          <div>
            <label
              htmlFor={`autor-${mensaje.id}`}
              className="block text-xs font-medium text-stone-700 mb-0.5"
            >
              Autor
            </label>
            <input
              id={`autor-${mensaje.id}`}
              name="nombreAutor"
              type="text"
              required
              defaultValue={mensaje.nombreAutor}
              className={clsx(
                "w-full rounded-md border px-3 py-1.5 text-sm bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400",
                errors.nombreAutor ? "border-rose-400" : "border-stone-200",
              )}
              aria-invalid={errors.nombreAutor ? "true" : undefined}
            />
            {errors.nombreAutor && (
              <p className="mt-0.5 text-xs text-rose-600">
                {errors.nombreAutor}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={`texto-${mensaje.id}`}
              className="block text-xs font-medium text-stone-700 mb-0.5"
            >
              Mensaje
            </label>
            <textarea
              id={`texto-${mensaje.id}`}
              name="texto"
              required
              rows={4}
              defaultValue={mensaje.texto}
              className={clsx(
                "w-full rounded-md border px-3 py-2 text-sm bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-y",
                errors.texto ? "border-rose-400" : "border-stone-200",
              )}
              aria-invalid={errors.texto ? "true" : undefined}
            />
            {errors.texto && (
              <p className="mt-0.5 text-xs text-rose-600">{errors.texto}</p>
            )}
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-stone-600 hover:text-stone-900"
            >
              Cancelar
            </button>
            <BotonGuardar />
          </div>
        </form>
      )}
    </li>
  );
}
