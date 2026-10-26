"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  LiberarInput,
  ReservarItemInput,
  parseFormData,
} from "@/lib/validation";
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

export async function liberarReserva(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseFormData(LiberarInput, formData);
  if (!parsed.ok) {
    return { ok: false, errors: { _: "Ítem inválido." } };
  }
  const { itemId } = parsed.data;

  const store = await cookies();
  const token = store.get(cookieName(itemId))?.value;
  if (!token) {
    return {
      ok: false,
      errors: {
        _: "No podemos confirmar que tú hiciste la reserva. Pídele a los papás que la liberen.",
      },
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({ where: { token } });
      if (!reserva || reserva.itemId !== itemId) {
        throw new Error("RESERVA_NOT_FOUND");
      }
      if (reserva.estado !== "activa") {
        throw new Error("RESERVA_NOT_ACTIVE");
      }

      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("ITEM_NOT_FOUND");
      // Si admin marcó "recibido", el regalo ya se entregó y no se libera.
      if (item.estado !== "reservado") {
        throw new Error("ITEM_NOT_RESERVED");
      }

      await tx.reserva.update({
        where: { id: reserva.id },
        data: { estado: "liberada" },
      });
      await tx.item.update({
        where: { id: itemId },
        data: { estado: "disponible" },
      });
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const msg =
      code === "RESERVA_NOT_FOUND"
        ? "No encontramos tu reserva. Puede que los papás ya la hayan gestionado."
        : code === "RESERVA_NOT_ACTIVE"
          ? "Tu reserva ya no está activa."
          : code === "ITEM_NOT_RESERVED"
            ? "Ese regalo ya no se puede liberar."
            : "No se pudo liberar la reserva. Intenta de nuevo.";
    // Si el cookie quedó huérfano (reserva inexistente/inactiva), limpiarlo.
    if (code === "RESERVA_NOT_FOUND" || code === "RESERVA_NOT_ACTIVE") {
      store.delete(cookieName(itemId));
    }
    return { ok: false, errors: { _: msg } };
  }

  store.delete(cookieName(itemId));
  revalidatePath("/");
  return { ok: true };
}
