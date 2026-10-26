import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { logout } from "@/app/admin/logout/actions";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-amber-100 bg-white p-5">
        <h2 className="text-lg font-semibold text-stone-900 mb-3">Secciones</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          <AdminLink href="/admin/items" label="Lista de ítems" descr="Crear, editar y marcar como ya tenemos" />
          <AdminLink href="/admin/reservas" label="Reservas" descr="Ver quién reservó qué y marcar recibidos" />
          <AdminLink href="/admin/mensajes" label="Mensajes" descr="Moderar mensajes públicos" />
          <AdminLink href="/admin/evento" label="Info del evento" descr="Fecha, hora, dirección y mapa" />
        </ul>
      </section>

      <section className="rounded-xl border border-amber-100 bg-white p-5">
        <h2 className="text-lg font-semibold text-stone-900 mb-2">Backup</h2>
        <p className="text-xs text-stone-500 mb-3">
          Descarga una copia de la base de datos (ítems, reservas, mensajes).
          Hazlo diario cerca del evento.
        </p>
        <a
          href="/admin/backup"
          className="inline-flex items-center gap-1.5 rounded-md bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold px-3 py-1.5"
        >
          Descargar backup .db
          <span aria-hidden>↓</span>
        </a>
      </section>

      <form action={logout} className="self-start">
        <button
          type="submit"
          className="text-sm text-rose-600 hover:underline"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

function AdminLink({
  href,
  label,
  descr,
  disabled,
}: {
  href: string;
  label: string;
  descr: string;
  disabled?: boolean;
}) {
  const content = (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-stone-900">{label}</span>
      <span className="text-xs text-stone-500">{descr}</span>
    </div>
  );
  if (disabled) {
    return (
      <li className="rounded-md border border-stone-200 bg-stone-50 p-3 opacity-60 cursor-not-allowed">
        {content}
      </li>
    );
  }
  return (
    <li>
      <Link
        href={href}
        className="block rounded-md border border-amber-100 bg-amber-50/50 p-3 hover:bg-amber-50 transition-colors"
      >
        {content}
      </Link>
    </li>
  );
}
