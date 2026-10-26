import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { MensajeAdminRow } from "@/components/admin/MensajeAdminRow";

export const dynamic = "force-dynamic";

export default async function AdminMensajesPage() {
  await requireAdmin();

  const mensajes = await prisma.mensaje.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-stone-900">
        Mensajes ({mensajes.length})
      </h2>
      {mensajes.length === 0 ? (
        <p className="text-stone-500 text-sm italic">
          Aún no hay mensajes publicados.
        </p>
      ) : (
        <ul className="space-y-2">
          {mensajes.map((m) => (
            <MensajeAdminRow key={m.id} mensaje={m} />
          ))}
        </ul>
      )}
    </div>
  );
}
