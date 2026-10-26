export default function Home() {
  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 sm:px-6 sm:py-16">
      <header className="text-center mb-10">
        <p className="text-sm uppercase tracking-widest text-rose-500 font-semibold mb-2">
          Baby shower
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold text-stone-900">
          Juan José
        </h1>
        <p className="mt-3 text-stone-600">
          Celebramos la llegada de nuestro bebé.
        </p>
      </header>

      <section className="rounded-2xl bg-white shadow-sm border border-amber-100 p-6 text-center">
        <p className="text-stone-500 text-sm">Pronto podrás ver aquí la lista de regalos y dejar un mensaje para el bebé.</p>
      </section>
    </main>
  );
}
