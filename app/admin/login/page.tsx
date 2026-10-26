import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/session";
import { LoginForm } from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-semibold text-stone-900 mb-1">Admin</h1>
      <p className="text-sm text-stone-600 mb-6">
        Ingresa la contraseña para gestionar la lista.
      </p>
      <LoginForm />
    </div>
  );
}
