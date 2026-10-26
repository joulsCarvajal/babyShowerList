"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { EditMensajeInput, parseFormData } from "@/lib/validation";
import type { ActionState } from "@/app/mensajes/actions";

export async function editarMensaje(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseFormData(EditMensajeInput, formData);
  if (!parsed.ok) {
    return {
      ok: false,
      errors: parsed.errors,
      values: {
        id: String(formData.get("id") ?? ""),
        nombreAutor: String(formData.get("nombreAutor") ?? ""),
        texto: String(formData.get("texto") ?? ""),
      },
    };
  }
  const { id, nombreAutor, texto } = parsed.data;
  await prisma.mensaje.update({
    where: { id },
    data: { nombreAutor, texto },
  });
  revalidatePath("/");
  revalidatePath("/admin/mensajes");
  return { ok: true };
}

export async function eliminarMensaje(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.mensaje.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/mensajes");
}
