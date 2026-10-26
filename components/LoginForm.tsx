"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { login, type LoginState } from "@/app/admin/login/actions";

function BotonIngresar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full inline-flex items-center justify-center rounded-md bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-2 transition-colors"
    >
      {pending ? "Verificando..." : "Ingresar"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    login,
    null,
  );
  const error = state?.error;

  return (
    <form
      action={formAction}
      className="rounded-xl border border-amber-100 bg-white p-5 flex flex-col gap-3"
      noValidate
    >
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className={clsx(
            "w-full rounded-md border px-3 py-2 text-sm bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400",
            error ? "border-rose-400" : "border-stone-200",
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "login-error" : undefined}
        />
        {error && (
          <p id="login-error" className="mt-1 text-xs text-rose-600">
            {error}
          </p>
        )}
      </div>
      <BotonIngresar />
    </form>
  );
}
