"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { publicarMensaje, type ActionState } from "@/app/mensajes/actions";

function BotonPublicar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white transition-colors",
        "bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 disabled:cursor-not-allowed",
      )}
    >
      {pending ? "Publicando..." : "Publicar mensaje"}
    </button>
  );
}

export function MensajeForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    publicarMensaje,
    null,
  );

  // Clave que cambia tras éxito → React desmonta y remonta el form, limpiando inputs.
  const [formKey, setFormKey] = useState(0);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      setFormKey((k) => k + 1);
      setJustSubmitted(true);
      const t = setTimeout(() => setJustSubmitted(false), 4000);
      return () => clearTimeout(t);
    }
  }, [state]);

  const errors = state && !state.ok ? state.errors : {};
  const values = state && !state.ok ? state.values : undefined;

  return (
    <form
      key={formKey}
      action={formAction}
      className="mb-6 rounded-xl border border-amber-100 bg-white p-4 flex flex-col gap-3"
      noValidate
    >
      <div>
        <label
          htmlFor="nombreAutor"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Tu nombre
        </label>
        <input
          id="nombreAutor"
          name="nombreAutor"
          type="text"
          required
          minLength={2}
          maxLength={60}
          defaultValue={values?.nombreAutor}
          placeholder="Ej. Ana María"
          className={clsx(
            "w-full rounded-md border px-3 py-2 text-sm bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400",
            errors.nombreAutor ? "border-rose-400" : "border-stone-200",
          )}
          aria-invalid={errors.nombreAutor ? "true" : undefined}
          aria-describedby={errors.nombreAutor ? "nombreAutor-error" : undefined}
        />
        {errors.nombreAutor && (
          <p id="nombreAutor-error" className="mt-1 text-xs text-rose-600">
            {errors.nombreAutor}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="texto"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Mensaje para Juan José
        </label>
        <textarea
          id="texto"
          name="texto"
          required
          minLength={5}
          maxLength={500}
          rows={4}
          defaultValue={values?.texto}
          placeholder="Escríbele un mensaje de cariño..."
          className={clsx(
            "w-full rounded-md border px-3 py-2 text-sm bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-y",
            errors.texto ? "border-rose-400" : "border-stone-200",
          )}
          aria-invalid={errors.texto ? "true" : undefined}
          aria-describedby={errors.texto ? "texto-error" : undefined}
        />
        {errors.texto && (
          <p id="texto-error" className="mt-1 text-xs text-rose-600">
            {errors.texto}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        {justSubmitted ? (
          <p className="text-sm text-emerald-700" role="status">
            ¡Gracias por tu mensaje! 💛
          </p>
        ) : (
          <span />
        )}
        <BotonPublicar />
      </div>
    </form>
  );
}
