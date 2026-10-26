"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import type { Item } from "@prisma/client";
import {
  editarItem,
  eliminarItem,
  toggleYaLoTenemos,
} from "@/app/admin/items/actions";
import type { ActionState } from "@/app/mensajes/actions";

const ESTADO_LABEL: Record<string, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  ya_lo_tenemos: "Ya lo tenemos",
  recibido: "Recibido",
};
const ESTADO_STYLES: Record<string, string> = {
  disponible: "bg-emerald-100 text-emerald-800",
  reservado: "bg-amber-100 text-amber-800",
  ya_lo_tenemos: "bg-stone-100 text-stone-500",
  recibido: "bg-sky-100 text-sky-800",
};

function BotonPendiente({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-xs font-semibold px-3 py-1.5"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function ItemAdminRow({
  item,
  categorias,
}: {
  item: Item;
  categorias: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [editState, editAction] = useActionState<ActionState, FormData>(
    editarItem,
    null,
  );

  useEffect(() => {
    if (editState?.ok) setEditing(false);
  }, [editState]);

  const errors = editState && !editState.ok ? editState.errors : {};
  const canToggle = item.estado === "disponible" || item.estado === "ya_lo_tenemos";

  return (
    <li className="rounded-xl border border-amber-100 bg-white p-4">
      {!editing ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
              <h4 className="text-sm font-semibold text-stone-900">{item.nombre}</h4>
              <span
                className={clsx(
                  "shrink-0 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase font-semibold",
                  ESTADO_STYLES[item.estado] ?? "",
                )}
              >
                {ESTADO_LABEL[item.estado] ?? item.estado}
              </span>
            </div>
            {item.nota && <p className="mt-1 text-xs text-stone-600">{item.nota}</p>}
            {item.linkReferencia && (
              <a
                href={item.linkReferencia}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-rose-600 hover:underline"
              >
                Ver referencia ↗
              </a>
            )}
          </div>
          <div className="flex flex-col gap-1 items-end shrink-0">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-stone-600 hover:text-stone-900"
            >
              Editar
            </button>
            {canToggle && (
              <form action={toggleYaLoTenemos}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="text-xs text-amber-700 hover:underline">
                  {item.estado === "ya_lo_tenemos" ? "Devolver a disponibles" : "Ya lo tenemos"}
                </button>
              </form>
            )}
            <form
              action={eliminarItem}
              onSubmit={(e) => {
                const msg =
                  item.estado === "reservado"
                    ? "Este ítem tiene una reserva activa. Al eliminarlo, la reserva se pierde. ¿Continuar?"
                    : "¿Eliminar este ítem?";
                if (!confirm(msg)) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" className="text-xs text-rose-600 hover:underline">
                Eliminar
              </button>
            </form>
          </div>
        </div>
      ) : (
        <form action={editAction} className="flex flex-col gap-3" noValidate>
          <input type="hidden" name="id" value={item.id} />
          <ItemCamposFormulario
            defaults={{
              nombre: item.nombre,
              categoria: item.categoria,
              nota: item.nota ?? "",
              linkReferencia: item.linkReferencia ?? "",
            }}
            errors={errors}
            categorias={categorias}
          />
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-stone-600 hover:text-stone-900"
            >
              Cancelar
            </button>
            <BotonPendiente label="Guardar" pendingLabel="Guardando..." />
          </div>
        </form>
      )}
    </li>
  );
}

export function ItemCamposFormulario({
  defaults,
  errors,
  categorias,
}: {
  defaults?: Partial<Record<"nombre" | "categoria" | "nota" | "linkReferencia", string>>;
  errors: Record<string, string>;
  categorias: string[];
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" name="nombre" required defaultValue={defaults?.nombre} error={errors.nombre} />
        <Field
          label="Categoría"
          name="categoria"
          required
          defaultValue={defaults?.categoria}
          error={errors.categoria}
          list="categorias-sugeridas"
        />
      </div>
      <datalist id="categorias-sugeridas">
        {categorias.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <Field label="Nota (opcional)" name="nota" defaultValue={defaults?.nota} error={errors.nota} />
      <Field
        label="Enlace de referencia (opcional)"
        name="linkReferencia"
        type="url"
        placeholder="https://..."
        defaultValue={defaults?.linkReferencia}
        error={errors.linkReferencia}
      />
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  error,
  list,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  list?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-stone-700 mb-0.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        list={list}
        className={clsx(
          "w-full rounded-md border px-3 py-1.5 text-sm bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400",
          error ? "border-rose-400" : "border-stone-200",
        )}
        aria-invalid={error ? "true" : undefined}
      />
      {error && <p className="mt-0.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
