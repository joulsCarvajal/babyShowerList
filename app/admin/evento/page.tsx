import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { utcToBogotaLocalInput } from "@/lib/tz";
import { EventoForm } from "@/components/admin/EventoForm";

export const dynamic = "force-dynamic";

export default async function AdminEventoPage() {
  await requireAdmin();

  const evento = await prisma.configEvento.findUnique({ where: { id: 1 } });
  const defaults = {
    fechaHora: evento ? utcToBogotaLocalInput(evento.fechaHora) : "",
    direccion: evento?.direccion ?? "",
    urlMaps: evento?.urlMaps ?? "",
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-amber-100 bg-white p-5">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">
          Información del evento
        </h2>
        <p className="text-xs text-stone-500 mb-4">
          La fecha y hora se interpretan en zona horaria de Bogotá y se
          guardan en UTC. Los cambios aparecen en la vista pública al
          instante.
        </p>
        <EventoForm defaults={defaults} />
      </section>
    </div>
  );
}
