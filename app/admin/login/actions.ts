"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import {
  checkRate,
  clearRate,
  getIpFromHeaders,
  registerFailure,
} from "@/lib/rate-limit";

export type LoginState =
  | { error: string }
  | null;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = getIpFromHeaders(await headers());
  const rate = checkRate(ip);
  if (!rate.allowed) {
    const mins = Math.ceil(rate.retryAfterSec / 60);
    return {
      error: `Demasiados intentos. Intenta de nuevo en ${mins} minuto${mins === 1 ? "" : "s"}.`,
    };
  }

  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return { error: "El admin no está configurado (ADMIN_PASSWORD faltante)." };
  }

  // Comparación en tiempo constante para evitar timing attacks baratos.
  if (!safeEqual(password, expected)) {
    registerFailure(ip);
    return { error: "Contraseña incorrecta." };
  }

  clearRate(ip);
  const session = await getAdminSession();
  session.authenticated = true;
  session.loggedInAt = Date.now();
  await session.save();

  redirect("/admin");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
