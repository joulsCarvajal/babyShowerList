import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ConfigEvento singleton (id = 1). Upsert para idempotencia.
  // Fecha: sábado 21 de noviembre de 2026, 3:00 pm hora Bogotá (UTC-5) = 20:00 UTC.
  // Dirección y hora exacta se ajustan vía /admin/evento antes del lanzamiento.
  const fechaHora = new Date("2026-11-21T20:00:00.000Z");
  await prisma.configEvento.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      fechaHora,
      direccion: "Por confirmar",
      urlMaps: "https://maps.app.goo.gl/ocycbEwUfrwrNwpt7",
    },
  });

  // Ítems de prueba — solo si la tabla está vacía (no sobreescribir cuando ya se cargó la lista real).
  const count = await prisma.item.count();
  if (count === 0) {
    await prisma.item.createMany({
      data: [
        {
          nombre: "Pañales talla recién nacido",
          categoria: "Pañales",
          nota: "Cualquier marca sirve",
          estado: "disponible",
        },
        {
          nombre: "Pañales talla 1",
          categoria: "Pañales",
          estado: "disponible",
        },
        {
          nombre: "Toallitas húmedas",
          categoria: "Higiene",
          nota: "Mejor sin fragancia",
          estado: "disponible",
        },
        {
          nombre: "Cuna",
          categoria: "Dormir",
          estado: "ya_lo_tenemos",
        },
        {
          nombre: "Monitor de bebé",
          categoria: "Dormir",
          linkReferencia: "https://ejemplo.com/monitor",
          estado: "disponible",
        },
      ],
    });
  }

  console.log("Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
