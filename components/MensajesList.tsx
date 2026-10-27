import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cookies } from "next/headers";
import { Buffer } from "node:buffer";
import { prisma } from "@/lib/db";
import { EMOJIS_REACCION } from "@/lib/validation";
import { ReaccionesBar } from "@/components/ReaccionesBar";

export async function MensajesList() {
  const [mensajes, store] = await Promise.all([
    prisma.mensaje.findMany({
      orderBy: { createdAt: "desc" },
      include: { reacciones: true },
    }),
    cookies(),
  ]);

  if (mensajes.length === 0) {
    return (
      <p className="text-stone-500 text-sm italic">
        Sé el primero en dejar un mensaje para Juan José.
      </p>
    );
  }

  const emojiHex = Object.fromEntries(
    EMOJIS_REACCION.map((e) => [Buffer.from(e).toString("hex"), e]),
  );
  const misCookies = store.getAll();

  return (
    <ul className="space-y-4">
      {mensajes.map((m) => {
        const counts: Record<string, number> = {};
        for (const r of m.reacciones) counts[r.emoji] = r.count;

        const misReacciones: Record<string, boolean> = {};
        const prefix = `rx_${m.id}_`;
        for (const c of misCookies) {
          if (!c.name.startsWith(prefix)) continue;
          const hex = c.name.slice(prefix.length);
          const emoji = emojiHex[hex];
          if (emoji) misReacciones[emoji] = true;
        }

        return (
          <li
            key={m.id}
            className="rounded-xl border border-amber-100 bg-white p-4"
          >
            <p className="whitespace-pre-wrap text-stone-800">{m.texto}</p>
            <p className="mt-2 text-xs text-stone-500">
              <span className="font-semibold text-stone-700">
                {m.nombreAutor}
              </span>
              {" · "}
              {formatDistanceToNow(m.createdAt, {
                locale: es,
                addSuffix: true,
              })}
            </p>
            <ReaccionesBar
              mensajeId={m.id}
              counts={counts}
              misReacciones={misReacciones}
            />
          </li>
        );
      })}
    </ul>
  );
}
