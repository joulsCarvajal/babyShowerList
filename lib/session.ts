import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type SessionOptions } from "iron-session";

export type AdminSession = {
  authenticated?: true;
  loggedInAt?: number;
};

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET no configurado o muy corto (mínimo 32 caracteres).",
    );
  }
  return {
    cookieName: "admin_session",
    password,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    },
  };
}

export async function getAdminSession() {
  return getIronSession<AdminSession>(await cookies(), sessionOptions());
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const s = await getAdminSession();
  return s.authenticated === true;
}

/** Usar al tope de cada page protegido en /admin/*. Lanza redirect si no auth. */
export async function requireAdmin() {
  const s = await getAdminSession();
  if (!s.authenticated) redirect("/admin/login");
  return s;
}
