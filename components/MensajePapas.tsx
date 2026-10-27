"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "mensaje-papas-visto-v1";

export function MensajePapas() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        dialogRef.current?.showModal();
      }
    } catch {
      // Si localStorage no está disponible (modo incógnito restringido), igual
      // mostramos el mensaje — más vale repetirlo que ocultarlo.
      dialogRef.current?.showModal();
    }
  }, []);

  function abrir() {
    dialogRef.current?.showModal();
  }

  function cerrar() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignorar
    }
    dialogRef.current?.close();
  }

  return (
    <>
      {/* Link discreto para releer el mensaje cuando quieran. Solo visible una vez montado,
          así SSR no muestra el link antes de que el modal autoabra en primera visita. */}
      {mounted && (
        <button
          type="button"
          onClick={abrir}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-rose-600 hover:underline"
        >
          <span aria-hidden>💌</span>
          Mensaje de los papás
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="rounded-2xl p-0 w-[min(100%,460px)] backdrop:bg-stone-900/50"
        onClick={(e) => {
          if (e.target === dialogRef.current) cerrar();
        }}
        aria-labelledby="mensaje-papas-titulo"
      >
        <div className="flex flex-col gap-4 p-6 bg-gradient-to-b from-amber-50 to-white">
          <header className="text-center">
            <p className="text-xs uppercase tracking-widest text-rose-600 font-semibold">
              Un mensaje para ti
            </p>
            <h3
              id="mensaje-papas-titulo"
              className="mt-1 text-xl font-semibold text-stone-900"
            >
              De parte de Tatiana y Julián
            </h3>
          </header>

          <p className="text-stone-800 text-base leading-relaxed">
            Gracias familia, gracias amigos por sus oraciones y compartir de
            cerca la alegría de la llegada de nuestro Juan José. Este espacio
            es solo una excusa para sentir el amor de Dios por medio de cada
            uno de ustedes.
          </p>

          <p className="text-stone-800 text-base leading-relaxed">
            Los queremos mucho <span aria-hidden>❤️</span> y gracias por
            siempre estar <span aria-hidden>🙏</span>
          </p>

          <p className="text-right text-sm text-stone-500 italic mt-1">
            — Tatiana y Julián
          </p>

          <div className="flex justify-center mt-2">
            <button
              type="button"
              onClick={cerrar}
              className="rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-6 py-2 transition-colors"
            >
              Gracias
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
