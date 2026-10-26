import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { NuevoItemForm } from "@/components/admin/NuevoItemForm";
import { ItemAdminRow } from "@/components/admin/ItemAdminRow";

export const dynamic = "force-dynamic";

export default async function AdminItemsPage() {
  await requireAdmin();

  const items = await prisma.item.findMany({
    orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
  });

  const categorias = Array.from(new Set(items.map((i) => i.categoria))).sort();

  const porCategoria = items.reduce<Record<string, typeof items>>((acc, i) => {
    (acc[i.categoria] ??= []).push(i);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-amber-100 bg-white p-5">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">
          Agregar ítem
        </h2>
        <NuevoItemForm categorias={categorias} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">
          Lista actual ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-stone-500 text-sm italic">
            Aún no has agregado ítems.
          </p>
        ) : (
          Object.entries(porCategoria).map(([cat, grupo]) => (
            <section key={cat} className="mb-5">
              <h3 className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-2">
                {cat}
              </h3>
              <ul className="space-y-2">
                {grupo.map((i) => (
                  <ItemAdminRow key={i.id} item={i} categorias={categorias} />
                ))}
              </ul>
            </section>
          ))
        )}
      </section>
    </div>
  );
}
