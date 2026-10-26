"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MensajeInput, parseFormData } from "@/lib/validation";

export type ActionState =
  | { ok: true }
  | {
      ok: false;
      errors: Record<string, string>;
      values?: Record<string, string>;
    }
  | null;

export async function publicarMensaje(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseFormData(MensajeInput, formData);
  if (!parsed.ok) {
    return {
      ok: false,
      errors: parsed.errors,
      values: {
        nombreAutor: String(formData.get("nombreAutor") ?? ""),
        texto: String(formData.get("texto") ?? ""),
      },
    };
  }

  await prisma.mensaje.create({
    data: {
      nombreAutor: parsed.data.nombreAutor,
      texto: parsed.data.texto,
    },
  });

  revalidatePath("/");
  return { ok: true };
}
