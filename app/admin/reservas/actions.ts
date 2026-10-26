"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function marcarRecibida(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.$transaction(async (tx) => {
    const reserva = await tx.reserva.findUnique({ where: { id } });
    if (!reserva || reserva.estado !== "activa") return;
    await tx.reserva.update({
      where: { id },
      data: { estado: "recibida" },
    });
    await tx.item.update({
      where: { id: reserva.itemId },
      data: { estado: "recibido" },
    });
  });

  revalidatePath("/");
  revalidatePath("/admin/reservas");
  revalidatePath("/admin/items");
}

export async function cancelarReserva(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.$transaction(async (tx) => {
    const reserva = await tx.reserva.findUnique({ where: { id } });
    if (!reserva || reserva.estado !== "activa") return;
    await tx.reserva.update({
      where: { id },
      data: { estado: "cancelada_admin" },
    });
    await tx.item.update({
      where: { id: reserva.itemId },
      data: { estado: "disponible" },
    });
    // Nota: la cookie del invitado queda huérfana. Al intentar liberar, la
    // action public la detectará (RESERVA_NOT_ACTIVE) y la borrará.
  });

  revalidatePath("/");
  revalidatePath("/admin/reservas");
  revalidatePath("/admin/items");
}
