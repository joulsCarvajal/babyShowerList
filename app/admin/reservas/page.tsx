import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { ReservaAcciones } from "@/components/admin/ReservaAcciones";

export const dynamic = "force-dynamic";

const ESTADO_HIST_LABEL: Record<string, { label: string; cls: string }> = {
  liberada: { label: "Liberada por invitado", cls: "text-stone-500" },
  cancelada_admin: { label: "Cancelada por admin", cls: "text-rose-600" },
  recibida: { label: "Recibida", cls: "text-emerald-700" },
};

export default async function AdminReservasPage() {
  await requireAdmin();

  const reservas = await prisma.reserva.findMany({
    orderBy: { createdAt: "desc" },
    include: { item: true },
  });

  const activas = reservas.filter((r) => r.estado === "activa");
  const historial = reservas.filter((r) => r.estado !== "activa");

  // Agrupar activas por nombreInvitado (preservando orden de aparición)
  const porInvitado = new Map<string, typeof activas>();
  for (const r of activas) {
    const arr = porInvitado.get(r.nombreInvitado) ?? [];
    arr.push(r);
    porInvitado.set(r.nombreInvitado, arr);
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">
          Reservas activas ({activas.length})
        </h2>
        {activas.length === 0 ? (
          <p className="text-stone-500 text-sm italic">
            Aún no hay reservas.
          </p>
        ) : (
          Array.from(porInvitado.entries()).map(([nombre, grupo]) => (
            <section key={nombre} className="mb-5">
              <h3 className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-2">
                {nombre} <span className="text-stone-400">· {grupo.length}</span>
              </h3>
              <ul className="space-y-2">
                {grupo.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-amber-100 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-900">
                          {r.item.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {r.item.categoria}{" "}
                          <span className="text-stone-400">
                            ·{" "}
                            {formatDistanceToNow(r.createdAt, {
                              locale: es,
                              addSuffix: true,
                            })}
                          </span>
                        </p>
                        {r.mensajeOpcional && (
                          <p className="mt-1 text-xs text-stone-600 italic">
                            “{r.mensajeOpcional}”
                          </p>
                        )}
                      </div>
                      <ReservaAcciones reservaId={r.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </section>

      <section>
        <details className="rounded-xl border border-stone-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-stone-700">
            Historial ({historial.length})
          </summary>
          {historial.length === 0 ? (
            <p className="mt-3 text-stone-500 text-sm italic">
              Nada todavía.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {historial.map((r) => {
                const meta =
                  ESTADO_HIST_LABEL[r.estado] ??
                  { label: r.estado, cls: "text-stone-500" };
                return (
                  <li
                    key={r.id}
                    className="flex items-start justify-between gap-3 text-xs rounded-md bg-stone-50 p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-stone-800">
                        {r.item.nombre}
                      </p>
                      <p className="text-stone-500">
                        {r.nombreInvitado} ·{" "}
                        {formatDistanceToNow(r.updatedAt, {
                          locale: es,
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <span className={`shrink-0 font-semibold ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </details>
      </section>
    </div>
  );
}
