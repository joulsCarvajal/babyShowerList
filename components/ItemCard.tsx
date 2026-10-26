import type { Item } from "@prisma/client";
import clsx from "clsx";
import { ReservarControl } from "@/components/ReservarControl";

const ESTADO_LABEL: Record<string, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  ya_lo_tenemos: "Ya lo tenemos",
  recibido: "Ya lo tenemos",
};

const ESTADO_STYLES: Record<string, string> = {
  disponible: "bg-emerald-100 text-emerald-800",
  reservado: "bg-amber-100 text-amber-800",
  ya_lo_tenemos: "bg-stone-100 text-stone-500",
  recibido: "bg-stone-100 text-stone-500",
};

export function ItemCard({ item, isMine }: { item: Item; isMine: boolean }) {
  const yaLoTienen =
    item.estado === "ya_lo_tenemos" || item.estado === "recibido";
  return (
    <article
      className={clsx(
        "flex flex-col gap-2 rounded-xl border p-4 bg-white transition",
        yaLoTienen ? "border-stone-200 opacity-60" : "border-amber-100",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h4
          className={clsx(
            "font-semibold text-base text-stone-900",
            yaLoTienen && "line-through decoration-stone-400",
          )}
        >
          {item.nombre}
        </h4>
        <span
          className={clsx(
            "shrink-0 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
            ESTADO_STYLES[item.estado] ?? ESTADO_STYLES.disponible,
          )}
        >
          {ESTADO_LABEL[item.estado] ?? item.estado}
        </span>
      </div>
      {item.nota && <p className="text-sm text-stone-600">{item.nota}</p>}
      {item.linkReferencia && (
        <a
          href={item.linkReferencia}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-rose-600 hover:underline w-fit"
        >
          Ver referencia ↗
        </a>
      )}
      <ReservarControl
        itemId={item.id}
        itemNombre={item.nombre}
        estado={item.estado}
        isMine={isMine}
      />
    </article>
  );
}
