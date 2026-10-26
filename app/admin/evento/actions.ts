"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { EventoInput, parseFormData } from "@/lib/validation";
import { bogotaLocalToUtc } from "@/lib/tz";
import type { ActionState } from "@/app/mensajes/actions";

export async function guardarEvento(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseFormData(EventoInput, formData);
  if (!parsed.ok) {
    return {
      ok: false,
      errors: parsed.errors,
      values: {
        fechaHora: String(formData.get("fechaHora") ?? ""),
        direccion: String(formData.get("direccion") ?? ""),
        urlMaps: String(formData.get("urlMaps") ?? ""),
      },
    };
  }

  const { fechaHora, direccion, urlMaps } = parsed.data;
  const fechaUtc = bogotaLocalToUtc(fechaHora);

  await prisma.configEvento.upsert({
    where: { id: 1 },
    create: { id: 1, fechaHora: fechaUtc, direccion, urlMaps },
    update: { fechaHora: fechaUtc, direccion, urlMaps },
  });

  revalidatePath("/");
  revalidatePath("/admin/evento");
  return { ok: true };
}
