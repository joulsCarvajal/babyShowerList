import { z } from "zod";

// Nombre: trim + min 2 + max 60. Permite letras, números, espacios, acentos y puntuación básica.
// Rechaza strings compuestos solo de puntuación o espacios después del trim.
const nombre = z
  .string()
  .trim()
  .min(2, "El nombre es muy corto.")
  .max(60, "El nombre es muy largo.")
  .regex(
    /[\p{L}\p{N}]/u,
    "El nombre debe contener al menos una letra o número.",
  );

export const ReservaInput = z.object({
  nombre,
  mensajeOpcional: z
    .string()
    .trim()
    .max(300, "El mensaje es muy largo (máximo 300 caracteres).")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});
export type ReservaInput = z.infer<typeof ReservaInput>;

export const ReservarItemInput = ReservaInput.extend({
  itemId: z.string().min(1),
});
export type ReservarItemInput = z.infer<typeof ReservarItemInput>;

export const MensajeInput = z.object({
  nombreAutor: nombre,
  texto: z
    .string()
    // No trim en texto, para preservar saltos de línea deliberados al inicio/final.
    .min(5, "El mensaje es muy corto (mínimo 5 caracteres).")
    .max(500, "El mensaje es muy largo (máximo 500 caracteres).")
    .refine((v) => v.trim().length >= 5, {
      message: "El mensaje no puede ser solo espacios.",
    }),
});
export type MensajeInput = z.infer<typeof MensajeInput>;

export const LiberarInput = z.object({
  itemId: z.string().min(1),
});
export type LiberarInput = z.infer<typeof LiberarInput>;

/**
 * Helper para server actions: convierte FormData a objeto plano y lo valida.
 * Retorna { ok: true, data } o { ok: false, errors } sin lanzar.
 */
export function parseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): { ok: true; data: z.infer<T> } | { ok: false; errors: Record<string, string> } {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") raw[key] = value;
  }
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".") || "_";
    if (!errors[path]) errors[path] = issue.message;
  }
  return { ok: false, errors };
}
