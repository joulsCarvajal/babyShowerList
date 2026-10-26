import Link from "next/link";
import { prisma } from "@/lib/db";
import { EventoHeader } from "@/components/EventoHeader";
import { ItemCard } from "@/components/ItemCard";
import { MensajesList } from "@/components/MensajesList";
import type { Item } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ocultar?: string }>;
}) {
  const params = await searchParams;
  const ocultar = params?.ocultar === "1";

  const items = await prisma.item.findMany({
    orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
  });

  const disponibles = items.filter((i) => i.estado === "disponible").length;
  const reservados = items.filter((i) => i.estado === "reservado").length;
  const yaTenemos = items.filter(
    (i) => i.estado === "ya_lo_tenemos" || i.estado === "recibido",
  ).length;

  const visibles = ocultar
    ? items.filter(
        (i) => i.estado !== "ya_lo_tenemos" && i.estado !== "recibido",
      )
    : items;

  const porCategoria = visibles.reduce<Record<string, Item[]>>((acc, i) => {
    (acc[i.categoria] ??= []).push(i);
    return acc;
  }, {});

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 sm:px-6 sm:py-16">
      <EventoHeader />

      <section className="mt-12" aria-labelledby="titulo-lista">
        <div className="flex items-baseline justify-between flex-wrap gap-x-4 gap-y-2 mb-5">
          <h2
            id="titulo-lista"
            className="text-2xl font-semibold text-stone-900"
          >
            Lista de regalos
          </h2>
          <p className="text-sm text-stone-600">
            <span className="text-emerald-700 font-medium">
              {disponibles} disponibles
            </span>
            {" · "}
            <span className="text-amber-700">{reservados} reservados</span>
            {" · "}
            <span className="text-stone-500">{yaTenemos} ya los tenemos</span>
          </p>
        </div>

        {yaTenemos > 0 && (
          <div className="mb-6">
            <Link
              href={ocultar ? "/" : "/?ocultar=1"}
              className="text-sm text-rose-600 hover:underline"
              scroll={false}
            >
              {ocultar
                ? "Mostrar los que ya tenemos"
                : "Ocultar los que ya tenemos"}
            </Link>
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-stone-500 italic">
            Pronto cargaremos la lista de regalos.
          </p>
        ) : Object.keys(porCategoria).length === 0 ? (
          <p className="text-stone-500 text-sm italic">
            No hay ítems que mostrar con el filtro actual.
          </p>
        ) : (
          Object.entries(porCategoria).map(([categoria, grupo]) => (
            <section key={categoria} className="mb-8">
              <h3 className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-3">
                {categoria}
              </h3>
              <div className="space-y-3">
                {grupo.map((i) => (
                  <ItemCard key={i.id} item={i} />
                ))}
              </div>
            </section>
          ))
        )}
      </section>

      <section className="mt-14" aria-labelledby="titulo-mensajes">
        <h2
          id="titulo-mensajes"
          className="text-2xl font-semibold text-stone-900 mb-2"
        >
          Mensajes para Juan José
        </h2>
        <p className="text-sm text-stone-600 mb-6">
          Déjale un mensaje de cariño que leerá cuando sea más grande.
        </p>
        {/* Formulario para publicar llega en T1.16 */}
        <MensajesList />
      </section>
    </main>
  );
}
