"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ReservarItemInput, parseFormData } from "@/lib/validation";
import type { ActionState } from "@/app/mensajes/actions";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 días

function cookieName(itemId: string) {
  return `reserva_${itemId}`;
}

export async function reservarItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseFormData(ReservarItemInput, formData);
  if (!parsed.ok) {
    return {
      ok: false,
      errors: parsed.errors,
      values: {
        itemId: String(formData.get("itemId") ?? ""),
        nombre: String(formData.get("nombre") ?? ""),
        mensajeOpcional: String(formData.get("mensajeOpcional") ?? ""),
      },
    };
  }

  const { itemId, nombre, mensajeOpcional } = parsed.data;
  const token = randomUUID();

  try {
    await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("ITEM_NOT_FOUND");
      if (item.estado !== "disponible") throw new Error("ITEM_NOT_AVAILABLE");

      await tx.item.update({
        where: { id: itemId },
        data: { estado: "reservado" },
      });

      await tx.reserva.create({
        data: {
          itemId,
          nombreInvitado: nombre,
          mensajeOpcional,
          token,
          estado: "activa",
        },
      });
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const msg =
      code === "ITEM_NOT_AVAILABLE"
        ? "Alguien más acaba de reservarlo. Elige otro de la lista."
        : code === "ITEM_NOT_FOUND"
          ? "Ese regalo ya no está en la lista."
          : "No se pudo registrar la reserva. Intenta de nuevo.";
    return { ok: false, errors: { _: msg } };
  }

  const store = await cookies();
  store.set(cookieName(itemId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  revalidatePath("/");
  return { ok: true };
}
