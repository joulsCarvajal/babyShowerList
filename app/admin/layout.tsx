import type { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-stone-800">
          <Link href="/admin" className="hover:text-rose-700">
            Admin · Baby shower
          </Link>
        </h1>
        <Link href="/" className="text-sm text-stone-500 hover:underline">
          ← Sitio público
        </Link>
      </div>
      {children}
    </div>
  );
}
