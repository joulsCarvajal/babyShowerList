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
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 hover:underline"
          >
            <svg
              aria-hidden
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            Ver ubicación
          </a>
          <a
            href="https://wa.link/s9gi6z"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white text-base font-semibold px-6 py-3 shadow-sm transition-colors"
          >
            <svg
              aria-hidden
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.46 0 .11 5.34.11 11.92c0 2.1.55 4.14 1.6 5.95L0 24l6.3-1.65a11.9 11.9 0 005.74 1.46h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.46-8.4zM12.05 21.8h-.01a9.9 9.9 0 01-5.04-1.38l-.36-.22-3.74.98 1-3.64-.24-.37a9.86 9.86 0 01-1.52-5.26c0-5.46 4.44-9.9 9.91-9.9a9.84 9.84 0 017 2.9 9.84 9.84 0 012.9 7c0 5.47-4.45 9.9-9.9 9.9zm5.44-7.42c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.63.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 01-1.65-2.05c-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.1 4.5.7.3 1.26.48 1.69.62.71.22 1.36.19 1.87.11.57-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
            </svg>
            Confirma tu asistencia
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
