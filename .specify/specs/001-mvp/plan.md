# Plan 001 — Implementación MVP Baby Shower

**Versión:** 1.0.0
**Fecha:** 2026-10-24
**Spec:** 001 v1.0.0 · **Constitution:** v0.2.0
**Deadline duro:** 2026-11-21 (evento). **Deadline blando:** 2026-11-10 (soft launch con familia para encontrar bugs).

Este documento define el **cómo**: stack concreto, estructura, modelo de datos, rutas, deploy y cronograma. Es el plano para `/tasks` y `/implement`.

---

## 1. Stack

| Capa | Elección | Razón |
|---|---|---|
| Framework | **Next.js 15** (App Router, TypeScript) | SSR nativo, server actions reemplazan API routes para formularios, imagen con `output: 'standalone'` baja a ~200 MB |
| UI | **Tailwind CSS v4** | Mobile-first, cero config pesada |
| DB | **SQLite** vía archivo persistente | Un archivo, backup = copiar archivo, cero infra extra |
| ORM | **Prisma** | Migrations declarativas, tipos autogenerados, cliente seguro |
| Auth admin | **iron-session** | Cookie firmada, sin tabla de sesiones, usa `ADMIN_PASSWORD` del env |
| Rate limit admin | **in-memory** (Map con TTL) | Una sola instancia, no se necesita Redis |
| Validación | **zod** | Validación de forms server-side |
| Deploy | **Docker multi-stage** en **Railway** con volumen montado en `/data` | SQLite necesita persistencia; Railway soporta volúmenes en hobby tier |
| Node | **20 LTS alpine** | Imagen chica, soportado por Prisma |
| Runtime | **Node runtime** (no Edge) | Prisma + SQLite requieren Node |

**Dependencias de producción (meta: < 15):** `next`, `react`, `react-dom`, `@prisma/client`, `prisma`, `iron-session`, `zod`, `clsx`, `date-fns`, `date-fns-tz`.

**Dev:** `typescript`, `@types/*`, `tailwindcss`, `eslint`, `prettier`.

---

## 2. Estructura del proyecto

```
babyShower/
├── .specify/                      # spec-kit (ya existe)
├── app/
│   ├── layout.tsx                 # root layout, meta noindex, fonts
│   ├── page.tsx                   # home pública (lista + info evento + mensajes)
│   ├── globals.css
│   ├── reservar/
│   │   └── actions.ts             # server actions: reservar, liberar
│   ├── mensajes/
│   │   └── actions.ts             # server action: publicar mensaje
│   └── admin/
│       ├── layout.tsx             # chequea sesión, redirige a /admin/login
│       ├── login/
│       │   ├── page.tsx
│       │   └── actions.ts         # verifica password, crea sesión
│       ├── items/
│       │   ├── page.tsx           # tabla + form crear/editar
│       │   └── actions.ts         # CRUD ítems + cambio de estado
│       ├── reservas/
│       │   ├── page.tsx           # lista agrupada por nombre
│       │   └── actions.ts         # marcar recibido, cancelar
│       ├── mensajes/
│       │   ├── page.tsx
│       │   └── actions.ts         # editar, borrar
│       ├── evento/
│       │   ├── page.tsx
│       │   └── actions.ts         # editar config
│       └── logout/
│           └── actions.ts
├── components/
│   ├── ItemCard.tsx
│   ├── ReservarModal.tsx          # client component con HTMX-like via useFormStatus
│   ├── MensajeForm.tsx
│   ├── EventoHeader.tsx
│   └── ui/                        # botones, inputs, etc.
├── lib/
│   ├── db.ts                      # Prisma client singleton
│   ├── session.ts                 # iron-session helpers
│   ├── rate-limit.ts              # Map in-memory por IP
│   ├── token.ts                   # genera / lee cookies de reserva
│   ├── tz.ts                      # formateo America/Bogota
│   └── validation.ts              # zod schemas
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                    # categorías base + evento default
├── public/
│   └── robots.txt                 # Disallow: /
├── Dockerfile
├── docker-compose.yml             # para dev local
├── .env.example
├── .dockerignore
├── next.config.ts                 # output: 'standalone'
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Modelo de datos (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // "file:/data/babyshower.db" en prod
}

enum EstadoItem {
  disponible
  reservado
  ya_lo_tenemos
  recibido
}

enum EstadoReserva {
  activa
  liberada            // invitado la liberó
  cancelada_admin
  recibida
}

model Item {
  id              String       @id @default(cuid())
  nombre          String
  categoria       String
  nota            String?
  linkReferencia  String?
  estado          EstadoItem   @default(disponible)
  reservas        Reserva[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([estado])
  @@index([categoria])
}

model Reserva {
  id               String        @id @default(cuid())
  itemId           String
  item             Item          @relation(fields: [itemId], references: [id], onDelete: Cascade)
  nombreInvitado   String
  mensajeOpcional  String?
  token            String        @unique            // cookie opaca
  estado           EstadoReserva @default(activa)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  @@index([itemId, estado])
  @@index([token])
}

model Mensaje {
  id          String   @id @default(cuid())
  nombreAutor String
  texto       String
  createdAt   DateTime @default(now())

  @@index([createdAt])
}

model ConfigEvento {
  id         Int      @id @default(1)              // singleton
  fechaHora  DateTime                               // UTC, se formatea a America/Bogota
  direccion  String
  urlMaps    String
  updatedAt  DateTime @updatedAt
}
```

**Invariante crítico (reserva única activa por ítem):** se enforce en código dentro de una transacción Prisma (SQLite no tiene índice único parcial fácil). El patrón en `reservar()`:

```ts
await prisma.$transaction(async (tx) => {
  const item = await tx.item.findUnique({ where: { id } });
  if (!item || item.estado !== 'disponible') throw new Error('No disponible');
  await tx.item.update({ where: { id }, data: { estado: 'reservado' } });
  const reserva = await tx.reserva.create({ data: { ... } });
  return reserva;
});
```

SQLite serializa escrituras → el `tx` evita doble reserva en race.

---

## 4. Rutas y server actions

| Ruta | Tipo | Función |
|---|---|---|
| `/` | page | Vista pública: info evento, lista de ítems, mensajes |
| `/reservar/actions.ts` → `reservarItem(itemId, formData)` | server action | Crea reserva, setea cookie `reserva_<itemId>=token` |
| `/reservar/actions.ts` → `liberarReserva(itemId)` | server action | Lee cookie, libera si token coincide |
| `/mensajes/actions.ts` → `publicarMensaje(formData)` | server action | Crea mensaje |
| `/admin/login` | page | Form password |
| `/admin/login/actions.ts` → `login(formData)` | server action | Verifica + rate limit + sesión |
| `/admin` | redirect | → `/admin/items` |
| `/admin/items` | page | CRUD ítems |
| `/admin/reservas` | page | Lista reservas, agrupadas por nombre |
| `/admin/mensajes` | page | Lista mensajes, editar/borrar |
| `/admin/evento` | page | Editar config evento |
| `/admin/logout` | server action | Destruye sesión |

**Protección de admin:** `app/admin/layout.tsx` llama a `getSession()`; si no autenticado y no estás en `/admin/login`, redirige. No se usa middleware para evitar edge runtime.

---

## 5. Decisiones de diseño clave

### 5.1 Cookie de reserva (anti-login para invitados)
- Al reservar, el server genera un `token` aleatorio (`crypto.randomUUID()`) y lo guarda en DB.
- Se setea cookie `reserva_<itemId>=<token>; HttpOnly; Secure; SameSite=Lax; Max-Age=90d`.
- Al liberar, se compara cookie contra el token en DB. Si no match: 403.
- Si el invitado borra cookies, pierde la capacidad de liberar desde la UI pública; debe pedírselo al admin.
- **Multi-reserva**: una cookie por ítem reservado. Simple y aislado.

### 5.2 Rate limit admin login
- Map en memoria: `IP → { intentos, resetAt, bloqueadoHasta }`.
- 5 intentos en 10 min → bloqueo 15 min.
- Se resetea con reinicio del proceso (aceptable para este scope).

### 5.3 Timezone
- `ConfigEvento.fechaHora` se guarda UTC.
- Se renderiza con `date-fns-tz` a `America/Bogota`.
- `createdAt` de mensajes se muestra como "hace X" con locale `es`.

### 5.4 Validación
Todo input pasa por zod en el server action:
```ts
const ReservaSchema = z.object({
  nombre: z.string().trim().min(2).max(60),
  mensajeOpcional: z.string().trim().max(300).optional(),
});
```

### 5.5 No JavaScript obligatorio
La lista se lee sin JS. Reservar / liberar / publicar funcionan como forms clásicos con server actions. Mejoras progresivas con `useFormStatus` para spinners.

### 5.6 Imagen Docker (meta < 300 MB)
```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0 DATABASE_URL=file:/data/babyshower.db
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

El `prisma migrate deploy` corre en cada startup — barato con SQLite, idempotente, no se necesita step aparte.

---

## 6. Variables de entorno

```
# .env.example
DATABASE_URL=file:./dev.db                 # local: archivo local; prod: file:/data/babyshower.db
ADMIN_PASSWORD=cambiame                    # contraseña admin
SESSION_SECRET=<string aleatorio 32+ chars> # para iron-session
NODE_ENV=development
```

En Railway: definir `ADMIN_PASSWORD`, `SESSION_SECRET`, y montar volumen en `/data`. `DATABASE_URL` ya viene por defecto en el Dockerfile.

---

## 7. Deploy en Railway

1. Crear proyecto Railway, conectar repo GitHub.
2. Railway detecta `Dockerfile`. Build automático.
3. En Settings → Volumes: crear volumen montado en `/data` (al menos 1 GB).
4. En Variables: setear `ADMIN_PASSWORD` y `SESSION_SECRET`.
5. Settings → Networking: generar dominio público (`xxx.up.railway.app`).
6. Deploy. Primer startup corre `prisma migrate deploy` y `prisma db seed` (solo en dev; en prod se evita).
7. Entrar a `/admin/login`, cargar lista de ítems y config del evento.

**Backup pre-evento:** `railway run cp /data/babyshower.db /tmp/backup.db` y descargar. Hacerlo el 20-nov.

---

## 8. Cronograma (deadline duro 21-nov, soft launch 10-nov)

Hoy: **viernes 24-oct**. Son **27 días** al evento, **17 días** al soft launch.

### Semana 1 — 25-oct a 31-oct (scaffold + lectura pública)
- Día 1-2: `create-next-app`, Tailwind, Prisma init, schema, migración inicial, Dockerfile, deploy "hola mundo" a Railway para validar pipeline.
- Día 3-4: Home pública con lista de ítems (read-only), info evento (hardcoded primero), sección mensajes (read-only). Diseño mobile-first.
- Día 5-7: Server action `publicarMensaje`, formulario funcional. Server action `reservarItem` con cookie. Server action `liberarReserva`.

**Hito S1:** sitio público navegable, se puede reservar/liberar/mensajear sin admin. Datos cargados vía Prisma Studio o seed.

### Semana 2 — 1-nov a 7-nov (admin + polish)
- Día 8-9: `/admin/login` + iron-session + rate limit. Layout protegido.
- Día 10-11: `/admin/items` CRUD completo incl. cambio de estado `ya_lo_tenemos`.
- Día 12-13: `/admin/reservas` (listado agrupado, marcar recibido, cancelar). `/admin/mensajes` (editar/borrar). `/admin/evento` (editar config).
- Día 14: Config evento movida a DB, home consume de DB. Toggle "ocultar ya tenemos" en home.

**Hito S2:** feature-complete. Deploy a Railway con DB persistente verificada.

### Semana 3 — 8-nov a 14-nov (hardening + soft launch)
- Día 15-16: Pruebas en celular real (iOS + Android desde WhatsApp). Fix de accesibilidad y mobile. Validaciones zod exhaustivas. Mensajes de error en español.
- Día 17: Cargar lista real de ítems como admin. Configurar fecha, dirección, URL Maps.
- **Día 18 (lunes 10-nov):** **Soft launch** — enviar link a familia cercana (6-10 personas) por WhatsApp. Pedir que prueben reservar / mensajear.
- Día 19-21: Observar comportamiento real, corregir bugs reportados, ajustar copy y UX según feedback.

**Hito S3:** feedback de familiares incorporado. Zero bugs conocidos.

### Semana 4 — 15-nov a 21-nov (lanzamiento)
- Día 22 (sábado 15-nov): **Lanzamiento amplio** — enviar link a todos los invitados.
- Día 23-27: monitoreo pasivo. Responder dudas por WhatsApp. Backup diario de la DB.
- **Día 28 (sábado 21-nov):** evento. Admin marca regalos recibidos en vivo.

### Buffers
- Si Semana 1 se atrasa > 2 días, cortar: `linkReferencia` en ítems, mensaje opcional al reservar, toggle de "ya lo tenemos" (dejar siempre visibles).
- Si Semana 2 se atrasa, cortar: edición de mensajes en admin (solo borrar).
- Si Semana 3 se atrasa, cortar soft launch amplio y lanzar directo el 15-nov con grupo chico.

---

## 9. Criterios de "code complete" por semana

- **S1:** `docker build .` ok. `docker compose up` ok. Home visible en localhost:3000.
- **S2:** Deploy Railway con volumen, admin funcional end-to-end, Lighthouse móvil ≥ 90 en performance y a11y.
- **S3:** 10 invitados reales han abierto el link y al menos 3 han reservado sin reportar bugs.
- **S4:** backup de DB en local el 20-nov.

---

## 10. Riesgos y mitigaciones

| Riesgo | Prob. | Mitigación |
|---|---|---|
| Volumen Railway no persiste correctamente | Media | Validar en S1 con un write/read de prueba y reinicio |
| Doble reserva por race condition | Baja | Transacción Prisma en `reservarItem` |
| Alguien comparte el link admin | Baja | URL `/admin` sin bruteforce (rate limit) + password larga |
| Dependencia pesada infla imagen > 300 MB | Media | `output: 'standalone'` + alpine; verificar en S1 |
| Deadline resbala por scope creep | **Alta** | Lista explícita de cortes en Buffers (§8). No agregar features después del 10-nov |
| Invitado pierde cookie y re-reserva pensando que falló | Media | Mensaje claro post-reserva: "guarda esta pestaña o pide a los papás que lo liberen" |

---

## 11. Checklist antes de `/tasks`

- [x] Stack confirmado (Next.js 15 + Prisma + SQLite + Tailwind + iron-session)
- [x] Deadline con margen (soft launch 10-nov, lanzamiento 15-nov, evento 21-nov)
- [x] Modelo de datos cerrado
- [x] Deploy target definido (Railway + volumen /data)
- [ ] URL de Google Maps del lugar (bloquea config inicial pero no desarrollo)
- [ ] Lista inicial de ~30-50 ítems (bloquea solo lanzamiento, no desarrollo)

---

## 12. Changelog

- **1.0.0 (2026-10-24):** Plan inicial. Stack Next.js 15 + SQLite + Prisma confirmado por usuario (opción A).
