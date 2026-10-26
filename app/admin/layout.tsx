import type { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-baseline justify-between">
        <Link
          href="/admin"
          className="text-lg font-semibold text-stone-800 hover:text-rose-600"
        >
          Admin · Baby shower
        </Link>
        <Link href="/" className="text-sm text-stone-500 hover:underline">
          ← Sitio público
        </Link>
      </div>
      {children}
    </div>
  );
}
