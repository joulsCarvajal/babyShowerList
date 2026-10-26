"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { crearItem } from "@/app/admin/items/actions";
import type { ActionState } from "@/app/mensajes/actions";
import { ItemCamposFormulario } from "./ItemAdminRow";

function BotonCrear() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white text-sm font-semibold px-4 py-1.5"
    >
      {pending ? "Agregando..." : "Agregar ítem"}
    </button>
  );
}

export function NuevoItemForm({ categorias }: { categorias: string[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    crearItem,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  const errors = state && !state.ok ? state.errors : {};
  const values = state && !state.ok ? state.values : undefined;

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3" noValidate>
      <ItemCamposFormulario defaults={values} errors={errors} categorias={categorias} />
      <div className="flex items-center justify-between">
        {state?.ok && (
          <p className="text-xs text-emerald-700" role="status">
            Agregado ✓
          </p>
        )}
        <div className="ml-auto">
          <BotonCrear />
        </div>
      </div>
    </form>
  );
}
