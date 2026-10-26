"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { guardarEvento } from "@/app/admin/evento/actions";
import type { ActionState } from "@/app/mensajes/actions";

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-sm font-semibold px-4 py-1.5"
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}

export function EventoForm({
  defaults,
}: {
  defaults: { fechaHora: string; direccion: string; urlMaps: string };
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    guardarEvento,
    null,
  );
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (state?.ok) {
      setSavedAt(Date.now());
      const t = setTimeout(() => setSavedAt(null), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  const errors = state && !state.ok ? state.errors : {};
  const values = state && !state.ok ? state.values : undefined;

  return (
    <form action={action} className="flex flex-col gap-3" noValidate>
      <div>
        <label
          htmlFor="fechaHora"
          className="block text-xs font-medium text-stone-700 mb-0.5"
        >
          Fecha y hora (hora de Bogotá)
        </label>
        <input
          id="fechaHora"
          name="fechaHora"
          type="datetime-local"
          required
          defaultValue={values?.fechaHora ?? defaults.fechaHora}
          className={clsx(
            "w-full rounded-md border px-3 py-1.5 text-sm bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400",
            errors.fechaHora ? "border-rose-400" : "border-stone-200",
          )}
          aria-invalid={errors.fechaHora ? "true" : undefined}
        />
        {errors.fechaHora && (
          <p className="mt-0.5 text-xs text-rose-600">{errors.fechaHora}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="direccion"
          className="block text-xs font-medium text-stone-700 mb-0.5"
        >
          Dirección
        </label>
        <input
          id="direccion"
          name="direccion"
          type="text"
          required
          defaultValue={values?.direccion ?? defaults.direccion}
          placeholder="Ej. Calle 100 #15-20, Bogotá"
          className={clsx(
            "w-full rounded-md border px-3 py-1.5 text-sm bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400",
            errors.direccion ? "border-rose-400" : "border-stone-200",
          )}
          aria-invalid={errors.direccion ? "true" : undefined}
        />
        {errors.direccion && (
          <p className="mt-0.5 text-xs text-rose-600">{errors.direccion}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="urlMaps"
          className="block text-xs font-medium text-stone-700 mb-0.5"
        >
          Enlace de Google Maps
        </label>
        <input
          id="urlMaps"
          name="urlMaps"
          type="url"
          required
          defaultValue={values?.urlMaps ?? defaults.urlMaps}
          placeholder="https://maps.app.goo.gl/..."
          className={clsx(
            "w-full rounded-md border px-3 py-1.5 text-sm bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400",
            errors.urlMaps ? "border-rose-400" : "border-stone-200",
          )}
          aria-invalid={errors.urlMaps ? "true" : undefined}
        />
        {errors.urlMaps && (
          <p className="mt-0.5 text-xs text-rose-600">{errors.urlMaps}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        {savedAt && (
          <p className="text-xs text-emerald-700" role="status">
            Guardado ✓
          </p>
        )}
        <div className="ml-auto">
          <BotonGuardar />
        </div>
      </div>
    </form>
  );
}
