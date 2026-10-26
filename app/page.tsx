import { EventoHeader } from "@/components/EventoHeader";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 sm:px-6 sm:py-16">
      <EventoHeader />

      <section className="mt-10 rounded-2xl bg-white shadow-sm border border-amber-100 p-6 text-center">
        <p className="text-stone-500 text-sm">
          Pronto podrás ver aquí la lista de regalos y dejar un mensaje para Juan
          José.
        </p>
      </section>
    </main>
  );
}
