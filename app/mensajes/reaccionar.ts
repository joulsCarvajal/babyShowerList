"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ReaccionInput } from "@/lib/validation";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

function cookieName(mensajeId: string, emoji: string) {
  return `rx_${mensajeId}_${Buffer.from(emoji).toString("hex")}`;
}

export async function reaccionarMensaje(
  mensajeId: string,
  emoji: string,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = ReaccionInput.safeParse({ mensajeId, emoji });
  if (!parsed.success) return { ok: false, error: "Entrada inválida." };

  const store = await cookies();
  const name = cookieName(parsed.data.mensajeId, parsed.data.emoji);
  if (store.get(name)) {
    return { ok: false, error: "Ya reaccionaste con este emoji." };
  }

  try {
    await prisma.mensajeReaccion.upsert({
      where: {
        mensajeId_emoji: {
          mensajeId: parsed.data.mensajeId,
          emoji: parsed.data.emoji,
        },
      },
      create: {
        mensajeId: parsed.data.mensajeId,
        emoji: parsed.data.emoji,
        count: 1,
      },
      update: { count: { increment: 1 } },
    });
  } catch {
    return { ok: false, error: "No se pudo registrar la reacción." };
  }

  store.set(name, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  revalidatePath("/");
  return { ok: true };
}
