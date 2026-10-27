import { prisma } from "@/lib/db";
import { formatEventoDisplay } from "@/lib/tz";

export async function EventoHeader() {
  const evento = await prisma.configEvento.findUnique({ where: { id: 1 } });

  return (
    <header className="text-center">
      <p className="text-sm uppercase tracking-widest text-rose-600 font-semibold mb-2">
        Baby Shower
      </p>
      <h1 className="text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight">
        Juan José
        <span className="block text-2xl sm:text-3xl text-stone-700 mt-1">
          Carvajal Ramírez
        </span>
      </h1>

      {evento ? (
        <div className="mt-6 inline-flex flex-col items-center gap-3 rounded-2xl bg-white border border-amber-100 shadow-sm px-6 py-5">
          <p className="text-base font-medium text-rose-600">
            ¡Te esperamos!
          </p>
          <p className="text-lg font-medium text-stone-800">
            {formatEventoDisplay(evento.fechaHora)}
          </p>
          <p className="text-stone-600 text-sm">{evento.direccion}</p>
          <a
            href={evento.urlMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-5 py-2 transition-colors"
          >
            Ver ubicación en Maps
            <span aria-hidden>↗</span>
          </a>
          <a
            href="https://wa.link/s9gi6z"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Confirma tu asistencia
            <span aria-hidden>↗</span>
          </a>
        </div>
      ) : (
        <p className="mt-6 text-stone-500 text-sm">
          Información del evento pendiente.
        </p>
      )}
    </header>
  );
}
