# Tasks 001 — Baby Shower MVP

**Versión:** 1.0.0
**Fecha:** 2026-10-24
**Plan:** 001 v1.0.0

Lista ejecutable de tareas. Cada tarea tiene definition of done (DoD) explícita. Las de **Semana 1** están desglosadas al nivel de "siguiente commit". Semanas 2–4 están a nivel de epic porque dependen del aprendizaje de S1.

**Datos ya resueltos:**
- URL Google Maps: `https://maps.app.goo.gl/ocycbEwUfrwrNwpt7`
- Lista inicial de ítems: se carga vía `/admin/items` en Semana 3 (día 17).

**Convención:**
- `T1.X` = tarea Semana 1 número X.
- Marca con `[x]` al completar.
- Si una tarea se parte, usar sub-letras: `T1.3a`, `T1.3b`.

---

## Semana 1 — 25-oct a 31-oct · Scaffold + lectura pública

### Bloque A — Scaffold (día 1)

- [x] **T1.1 — Inicializar proyecto Next.js 15 + TypeScript + Tailwind** *(resultado: Next 16.4.3 + React 19.3 + Tailwind v4; superset compatible)*
  - Comando: `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
  - Añadir `output: 'standalone'` en `next.config.ts`.
  - Añadir `.nvmrc` con `20`.
  - **DoD:** `npm run dev` corre y muestra la página default en `localhost:3000`.

- [x] **T1.2 — Instalar dependencias de producción** *(Prisma pineado a ^6 por inestabilidad de 7.10 en install; scripts aprobados en `allowScripts` de package.json)*
  - `npm i @prisma/client iron-session zod clsx date-fns date-fns-tz`
  - `npm i -D prisma @types/node`
  - **DoD:** `package.json` lista las 10 deps del plan §1, sin extras.

- [x] **T1.3 — Configurar Prisma + schema inicial** *(SQLite no soporta enums; se cambiaron a `String` con valores permitidos documentados en comentario del schema. Provider `prisma-client-js` legacy para que `import { PrismaClient } from '@prisma/client'` funcione como en el plan)*
  - `npx prisma init --datasource-provider sqlite`
  - Copiar schema del plan §3 a `prisma/schema.prisma`.
  - `DATABASE_URL="file:./dev.db"` en `.env.local`.
  - `npx prisma migrate dev --name init`
  - **DoD:** `dev.db` existe, `npx prisma studio` abre y muestra las 4 tablas vacías.

- [x] **T1.4 — Seed con config evento y categorías base** *(seed config registrada en `prisma.config.ts` → `migrations.seed`, no en `package.json` como el plan 1.0.0; idempotente vía upsert + `count()==0`)*
  - Crear `prisma/seed.ts` que inserta `ConfigEvento` singleton (id=1) con:
    - `fechaHora`: 2026-11-21T15:00:00-05:00 (ajustar hora cuando se confirme)
    - `direccion`: "Por confirmar"
    - `urlMaps`: `https://maps.app.goo.gl/ocycbEwUfrwrNwpt7`
  - Opcional: 2-3 ítems de prueba.
  - Añadir `"prisma": { "seed": "tsx prisma/seed.ts" }` y `tsx` como dev dep.
  - `npx prisma db seed`.
  - **DoD:** `ConfigEvento` tiene registro visible en Prisma Studio.

- [x] **T1.5 — Prisma client singleton en `lib/db.ts`**
  - Patrón global para evitar múltiples instancias en dev con HMR.
  - **DoD:** importar `prisma` desde `@/lib/db` funciona en un server component.

### Bloque B — Deploy pipeline (día 2)

- [x] **T1.6 — Dockerfile multi-stage + .dockerignore** *(Node bump 20→22-alpine: Next 16 + iron-session requieren Node ≥22. Imagen final 155 MB, bajo el límite de 300. Fix: `ENV DATABASE_URL` dummy en builder porque `prisma.config.ts` valida env en load aunque `generate` no la use)*
  - Copiar Dockerfile del plan §5.6.
  - `.dockerignore`: `node_modules`, `.next`, `.git`, `*.db`, `.env*`.
  - **DoD:** `docker build -t babyshower .` termina sin errores, imagen < 300 MB (`docker images`).

- [x] **T1.7 — docker-compose.yml para dev local** *(compose carga solo secretos vía `environment:` para que `DATABASE_URL=file:/data/...` del Dockerfile no sea sobrescrita por `.env`. Volumen `./data:/data` validado end-to-end — DB persistente)*
  - Servicio único con volumen local `./data:/data`.
  - **DoD:** `docker compose up` levanta y responde en `localhost:3000`.

- [x] **T1.8 — Deploy inicial a Railway** *(URL: babyshowerlist-production.up.railway.app · HTTP 200 público · volumen `/data` persiste entre redeploys confirmado. Fix on-the-way: entrypoint `su-exec` para corregir ownership del volumen montado por Railway como root)*
  - Crear repo GitHub `babyshower`, push.
  - Conectar repo en Railway, crear proyecto.
  - Crear volumen montado en `/data`.
  - Setear vars: `ADMIN_PASSWORD`, `SESSION_SECRET` (generar con `openssl rand -hex 32`).
  - Generar dominio público.
  - **DoD:** URL Railway responde con la home default y la DB persiste tras un `redeploy` manual.

- [x] **T1.9 — robots.txt + meta noindex** *(también html lang="es", título y descripción en español)*
  - `public/robots.txt`: `User-agent: *\nDisallow: /`.
  - En `app/layout.tsx`: `metadata.robots = { index: false, follow: false }`.
  - **DoD:** `curl <url>/robots.txt` devuelve el disallow; HTML tiene `<meta name="robots" content="noindex,nofollow">`.

### Bloque C — UI pública read-only (días 3-4)

- [x] **T1.10 — Layout raíz + fuentes + styling base** *(Fraunces display + Nunito body via next/font, paleta amber/rose, viewport themeColor, home placeholder reemplaza default de create-next-app)*
  - `app/layout.tsx` con `<html lang="es">`, viewport mobile, título "Baby shower de Juan José".
  - Tipografía system-ui + tailwind config con paleta cálida (sugerencia: `amber`, `rose`).
  - **DoD:** render en móvil se ve equilibrado, sin FOUC.

- [x] **T1.11 — `components/EventoHeader.tsx`** *(server component; `lib/tz.ts` con `formatEventoDisplay` en español vía date-fns-tz; home ahora `dynamic` porque lee DB; también `cacheComponents` removido de next.config)*
  - Lee `ConfigEvento` desde server component padre.
  - Muestra: título, fecha formateada en `America/Bogota` con `date-fns-tz`, dirección, botón "Ver ubicación en Maps" (target=_blank, rel=noopener).
  - **DoD:** header visible y accesible, botón abre la URL de Maps.

- [x] **T1.12 — Lista de ítems read-only con agrupación por categoría** *(contadores correctos verificados con seed: 4 disp · 0 res · 1 ya; toggle `?ocultar=1` oculta ya tenemos; anonimato: estado `reservado` no revela nombre)*
  - Server component en `app/page.tsx` que hace `prisma.item.findMany({ orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }] })`.
  - `ItemCard` muestra: nombre, nota, link si existe, badge de estado.
  - Agrupar por `categoria` con `<section>` por grupo.
  - Resumen arriba: `X disponibles · Y reservados · Z ya los tenemos`.
  - Toggle "ocultar los que ya tenemos" (client component, estado en URL `?ocultar=1`).
  - **DoD:** con 5 ítems seed, se renderizan correctamente y el toggle funciona.

- [x] **T1.13 — Sección mensajes read-only** *(seed con mensaje de bienvenida de Tatiana y Julián, para que la vista tenga algo que mostrar antes del lanzamiento. "hace X" en español vía `formatDistanceToNow` + locale `es`)*
  - Server component que lista mensajes `orderBy: { createdAt: 'desc' }`.
  - Formato: nombre en bold, texto, "hace X" con `formatDistance` en es.
  - **DoD:** mensajes seed se muestran correctamente.

### Bloque D — Interacciones públicas (días 5-7)

- [x] **T1.14 — zod schemas en `lib/validation.ts`** *(incluye helper `parseFormData` que convierte `FormData` a objeto validado para server actions; 10/10 casos probados vía tsx)*
  - `ReservaInput`, `MensajeInput`, `LiberarInput`.
  - **DoD:** schemas exportados, cubren validaciones del spec §6.

- [x] **T1.15 — Server action `publicarMensaje`** *(ActionState devuelve `values` en error para que el form reponga los campos tras rechazo)*
  - En `app/mensajes/actions.ts`, con `"use server"`.
  - Valida con zod, inserta, `revalidatePath('/')`.
  - **DoD:** desde un `<form action={publicarMensaje}>` se publica y aparece sin recargar manualmente.

- [x] **T1.16 — Formulario de mensaje en home** *(useActionState + useFormStatus; errores inline en español vía `aria-invalid` y `aria-describedby`; valores se repueblan en error; en éxito el form se desmonta con `key` y muestra toast transitorio por 4s)*
  - Client component `MensajeForm.tsx` con `useFormStatus` para disabled durante submit.
  - Mensajes de error inline en español.
  - **DoD:** publicar funciona, errores se muestran, submit doble bloqueado.

- [x] **T1.17 — Server action `reservarItem` con transacción + cookie** *(race condition verificada contra SQLite: segunda reserva simultánea rechazada con "ITEM_NOT_AVAILABLE"; cookie `reserva_<itemId>` HttpOnly + SameSite=Lax + 90d TTL + Secure solo en prod)*
  - Transacción Prisma: valida estado `disponible`, cambia a `reservado`, crea `Reserva` con token.
  - Setea cookie `reserva_<itemId>` con `cookies().set()`.
  - `revalidatePath('/')`.
  - **DoD:** reservar un ítem lo mueve a `reservado` y la cookie queda. Doble reserva simultánea (dos pestañas) falla la segunda limpiamente.

- [x] **T1.18 — Server action `liberarReserva`** *(cookie opaca verificada contra token en DB; reserva pasa a estado `liberada` como auditoría, no se borra; cookies huérfanas se limpian; probado happy path + stale token + token aleatorio + re-reservar)*
  - Lee cookie `reserva_<itemId>`, compara con `token` en DB.
  - Transacción: cambia `Reserva.estado` a `liberada` y `Item.estado` a `disponible`.
  - Borra cookie.
  - **DoD:** desde la UI, el invitado que reservó ve botón "Ya no podré regalarlo" y funciona.

- [x] **T1.19 — Modal/sheet de reserva en `ItemCard`** *(usa `<dialog>` nativo HTML; `ReservarControl` decide qué mostrar según estado + cookie; backdrop/ESC naturales; confirm nativo antes de liberar)*
  - Client component que muestra form con nombre + mensaje opcional al pulsar "Lo regalo yo".
  - Confirmación visual tras éxito.
  - **DoD:** flujo A del spec §5 completo end-to-end en móvil.

- [x] **T1.20 — Pruebas manuales S1 en localhost** *(5 escenarios validados vía curl+cookies+DB: anónimo ve "Lo regalo yo"; invitado 2 sin cookie ve "Reservado" sin acción; invitado 1 con cookie ve "Ya no podré regalarlo"; liberar vuelve a `disponible`; 3 mensajes orden desc por createdAt confirmado)*
  - Reservar desde una pestaña, verificar que otra pestaña ve `reservado` sin botón.
  - Liberar desde pestaña original, verificar vuelta a `disponible`.
  - Publicar 3 mensajes, verificar orden.
  - **DoD:** checklist corrido sin bugs.

**Hito S1 (viernes 31-oct):** app pública funcional en Railway. Admin aún no existe; items se cargan vía Prisma Studio contra la DB local y se promueven con un dump a prod (o se posterga a S2).

---

## Semana 2 — 1-nov a 7-nov · Admin completo

Epics, no tareas de un commit. Desglosar al terminar S1.

- [x] **T2.1 — Infra de sesión y rate limit** *(iron-session cookie `admin_session` 7d; rate-limit en Map validado: 5 fails/10min → bloqueo 15min, auto-expira, aislamiento por IP)*
  - `lib/session.ts` con iron-session (cookie `admin_session`, 7 días).
  - `lib/rate-limit.ts` Map en memoria por IP, 5 intentos / 10 min, bloqueo 15 min.
- [x] **T2.2 — `/admin/login` + protección de layout** *(gate vía `requireAdmin()` helper en cada page protegido, no middleware ni route groups — más explícito; constant-time password compare; local test: GET /admin sin cookie → 307 /admin/login)*
  - Form password, server action que valida contra `ADMIN_PASSWORD`, aplica rate limit.
  - `app/admin/layout.tsx` redirige si no autenticado.
  - Botón logout.
- [x] **T2.3 — `/admin/items` CRUD** *(crear, editar inline, eliminar con confirm diferenciado si hay reserva activa, toggle `ya_lo_tenemos`↔`disponible` sin tocar `reservado`/`recibido`, autocompletar categorías vía `<datalist>` nativo con categorías existentes)*
  - Tabla, formulario crear/editar (incluye categoría con sugerencia autocompletar basada en existentes), acción cambiar estado `ya_lo_tenemos ↔ disponible`, eliminar con confirmación.
- [x] **T2.4 — `/admin/reservas`** *(activas agrupadas por `nombreInvitado`; mensaje opcional del invitado se ve; historial colapsado vía `<details>` con labels color-coded; marcar recibida es terminal, cancelar libera el ítem sin tocar la cookie del invitado — se auto-limpia después)*
  - Lista agrupada visualmente por `nombreInvitado`, con fecha y mensaje opcional.
  - Acciones: marcar recibida, cancelar.
  - Sección colapsada "historial de liberadas / canceladas".
- [x] **T2.5 — `/admin/mensajes`** *(editar inline con zod validation; eliminar es hard delete per spec §9)*
  - Tabla con editar inline y borrar con confirmación.
- [x] **T2.6 — `/admin/evento`** *(datetime-local se interpreta en Bogotá y se guarda en UTC; roundtrip verificado: 15:00 Bogotá ↔ 20:00 UTC; home consume via `formatEventoDisplay`)*
  - Formulario con fecha-hora (datetime-local), dirección, URL Maps. Guarda a `ConfigEvento` id=1.
- [x] **T2.7 — Home consume `ConfigEvento` de DB (eliminar hardcodes)** *(verificado via grep: no hay fechas/URLs hardcoded en `app/` ni `components/`; valores literales viven solo en `prisma/seed.ts` como estado inicial de la DB)*
- [x] **T2.8 — Deploy S2 a Railway y pruebas end-to-end en móvil** *(bug encontrado + arreglado en móvil real: `onSubmit` en server component de `/admin/reservas` → extraído a client component)*

**Hito S2 (viernes 7-nov):** feature-complete. Lighthouse móvil ≥ 90 perf + a11y.

---

## Semana 3 — 8-nov a 14-nov · Hardening + soft launch

- [x] **T3.1 — Pruebas en iOS Safari y Android Chrome vía WhatsApp (abrir link desde chat real).** *(WhatsApp abre el link en el browser default del OS, no en webview in-app → mejor escenario; cookies/dialog/modal funcionan sin quirks)*
- [x] **T3.2 — Pulido de copy en español, mensajes de error consistentes.** *(auditoría de todas las strings visibles al usuario; cambios: enumeraciones con "y" antes del último item, toasts unificados, "Devolver a disponibles" y "Marcar recibido" por claridad; errores de validación ya consistentes desde S1)*
- [x] **T3.3 — A11y pass: labels, contraste, focus visible, orden de tabulación.** *(contraste: rose-500→600, emerald-600→700 para pasar AA en botones primarios; focus-visible global para button/a/summary; h1 en layout admin; labels y aria-* ya existían desde S1)*
- [x] **T3.4 — Cargar lista real de ítems** vía `/admin/items` (sesión conjunta Tatiana + Julián).
- [x] **T3.5 — Configurar `ConfigEvento` real** (hora exacta, dirección completa).
- [x] **T3.6 — Soft launch lunes 10-nov** — enviar link a 6-10 familiares cercanos *(adelantado al 2026-10-26 porque el MVP quedó listo con 15 días de buffer)*.
- [ ] **T3.7 — Triage de bugs 10-nov a 14-nov** y fix *(en curso: ventana de feedback activa)*.
- [x] **T3.8 — Backup manual de DB** *(sustituido el flujo CLI por ruta web `/admin/backup` protegida — más repetible; backup pre-launch confirmado por Julián)*.

**Hito S3 (viernes 14-nov):** zero bugs conocidos, feedback incorporado.

---

## Semana 4 — 15-nov a 21-nov · Lanzamiento

- [ ] **T4.1 — Sábado 15-nov: enviar link a todos los invitados por WhatsApp.**
- [ ] **T4.2 — Monitoreo pasivo:** revisar admin diario, responder dudas.
- [ ] **T4.3 — Backup diario de DB** (16, 18, 20-nov).
- [ ] **T4.4 — Jueves 20-nov: backup final + verificación de la lista.**
- [ ] **T4.5 — Sábado 21-nov: evento.** Admin marca recibidos en vivo desde el celular.

---

## Reglas de ejecución

- Marcar tareas al cerrar PR, no al abrir.
- Si una tarea toma >1.5× lo estimado, parar y revisar scope.
- No agregar tareas nuevas después del **10-nov** sin recortar otras (regla dura).
- Cualquier bug encontrado en S3/S4 que no sea "la app no abre" o "pierde datos" se registra pero no se arregla hasta después del evento.

---

## Changelog

- **1.0.0 (2026-10-24):** Tasks iniciales. Semana 1 desglosada a 20 tareas; S2–S4 a epics.
