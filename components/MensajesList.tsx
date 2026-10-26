import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { prisma } from "@/lib/db";

export async function MensajesList() {
  const mensajes = await prisma.mensaje.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (mensajes.length === 0) {
    return (
      <p className="text-stone-500 text-sm italic">
        Sé el primero en dejar un mensaje para Juan José.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {mensajes.map((m) => (
        <li
          key={m.id}
          className="rounded-xl border border-amber-100 bg-white p-4"
        >
          <p className="whitespace-pre-wrap text-stone-800">{m.texto}</p>
          <p className="mt-2 text-xs text-stone-500">
            <span className="font-semibold text-stone-700">{m.nombreAutor}</span>
            {" · "}
            {formatDistanceToNow(m.createdAt, { locale: es, addSuffix: true })}
          </p>
        </li>
      ))}
    </ul>
  );
}
