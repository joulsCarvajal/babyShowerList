"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import {
  EditItemInput,
  ItemInput,
  parseFormData,
} from "@/lib/validation";
import type { ActionState } from "@/app/mensajes/actions";

export async function crearItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseFormData(ItemInput, formData);
  if (!parsed.ok) {
    return {
      ok: false,
      errors: parsed.errors,
      values: formDataToStrings(formData, ["nombre", "categoria", "nota", "linkReferencia"]),
    };
  }
  await prisma.item.create({
    data: {
      nombre: parsed.data.nombre,
      categoria: parsed.data.categoria,
      nota: parsed.data.nota,
      linkReferencia: parsed.data.linkReferencia,
      estado: "disponible",
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/items");
  return { ok: true };
}

export async function editarItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseFormData(EditItemInput, formData);
  if (!parsed.ok) {
    return {
      ok: false,
      errors: parsed.errors,
      values: formDataToStrings(formData, [
        "id",
        "nombre",
        "categoria",
        "nota",
        "linkReferencia",
      ]),
    };
  }
  const { id, nombre, categoria, nota, linkReferencia } = parsed.data;
  await prisma.item.update({
    where: { id },
    data: { nombre, categoria, nota: nota ?? null, linkReferencia: linkReferencia ?? null },
  });
  revalidatePath("/");
  revalidatePath("/admin/items");
  return { ok: true };
}

export async function eliminarItem(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  // onDelete: Cascade en Reserva se encarga de limpiar reservas asociadas.
  await prisma.item.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/items");
}

export async function toggleYaLoTenemos(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return;

  // Toggle: ya_lo_tenemos ↔ disponible. No afecta reservado/recibido.
  if (item.estado === "ya_lo_tenemos") {
    await prisma.item.update({
      where: { id },
      data: { estado: "disponible" },
    });
  } else if (item.estado === "disponible") {
    await prisma.item.update({
      where: { id },
      data: { estado: "ya_lo_tenemos" },
    });
  }
  revalidatePath("/");
  revalidatePath("/admin/items");
}

function formDataToStrings(
  fd: FormData,
  keys: readonly string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = String(fd.get(k) ?? "");
  return out;
}
