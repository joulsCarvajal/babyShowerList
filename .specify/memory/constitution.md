# Baby Shower MVP — Constitution

**Versión:** 0.2.0
**Última actualización:** 2026-10-24

Este documento define los principios no negociables del proyecto. Toda spec, plan e implementación debe cumplirlo. Si una decisión futura entra en conflicto, se cambia la constitution explícitamente antes de proceder.

---

## Contexto

Aplicación web interna para el baby shower de **Juan José**, hijo de **Tatiana y Julián**. Fecha del evento: **21 de noviembre de 2026** (~4 semanas desde hoy). La usan los invitados para ver qué regalos ya tenemos y cuáles faltan, reservar uno para regalar, dejar un mensaje para el bebé y ver el mapa del lugar. Es de un solo uso, vida útil corta, audiencia pequeña y conocida.

El deadline corto es parte de la constitution: cualquier decisión que no quepa holgadamente antes del 21 de noviembre queda fuera.

---

## Principios

### I. MVP radical — solo lo que se usa el día del evento
Cada feature debe justificarse contra la pregunta: *¿esto se usa antes o durante el evento?* Si no, no entra. Nada de perfiles, feeds, notificaciones push, analítica, dashboards. Mejor terminar y pulir que agregar.

### II. Simplicidad operativa sobre elegancia técnica
Un solo contenedor Docker desplegable en Railway. Una sola base de datos. Sin colas, sin workers, sin microservicios. Si una decisión agrega infraestructura, requiere justificación explícita en el plan.

### III. Invitados sin fricción, sin cuentas
Los invitados acceden por link compartido (WhatsApp). No hay registro ni login para invitados. Al reservar un regalo o dejar un mensaje, escriben su nombre en un campo. Nada más.

### IV. Anonimato asimétrico (solo para regalos)
Los invitados **no** pueden ver quién reservó qué regalo. Los dueños del evento **sí** ven las reservas con nombre en una vista admin protegida con contraseña simple. Esta asimetría es un requisito funcional, no cosmético: el sistema nunca expone el nombre del reservante en respuestas públicas.

Los **mensajes para el bebé sí muestran el nombre** del autor públicamente — son parte del cariño del evento, no información sensible.

### V. Reservas honestas, no transacciones
Reservar un regalo es una promesa social, no una compra. El sistema permite:
- Marcar un ítem como "lo voy a regalar yo" (requiere nombre).
- Liberar la reserva si cambia de idea.

Nada de pagos, pasarelas, tracking de envío. El estado "ya lo tenemos" lo controla **únicamente el admin** — es la fuente de verdad de lo que la familia realmente posee, no una autodeclaración de invitados. Si el regalo llega, la familia lo marca manualmente como *recibido* en admin.

### VI. Datos privados por defecto
El sitio no se indexa (robots.txt disallow, meta noindex). Sin analytics de terceros. Sin trackers. Los nombres de invitados y mensajes son datos personales de allegados: se almacenan solo lo necesario y se borran tras el evento.

### VII. Mobile-first, español
La mayoría abrirá el link desde el celular en WhatsApp. UI diseñada primero para móvil. Todo el copy en español.

---

## Restricciones técnicas

- **Deploy:** contenedor Docker, target Railway (o equivalente). Un `Dockerfile`, un `docker-compose.yml` para local.
- **Persistencia:** una sola DB. Preferencia por SQLite con volumen persistente si Railway lo soporta cómodamente; si no, Postgres gestionado por Railway. Decisión final en `/plan`.
- **Auth admin:** contraseña única por variable de entorno, sesión por cookie firmada. Sin OAuth, sin usuarios múltiples.
- **Stack:** por definir en `/plan`. Criterios: pocas dependencias, SSR o SSG simple, build rápido, imagen Docker < 300 MB.
- **Sin dependencias externas en runtime:** no servicios de email, SMS, pagos ni analítica.
- **Mapa:** link externo a Google Maps (URL que proveerá Julián). No se embebe iframe ni se consume API — basta con un botón "Ver ubicación en Maps" que abre la app nativa en móvil.

---

## Alcance del MVP (features confirmadas)

1. **Lista de regalos** con estado: `disponible`, `reservado`, `ya lo tenemos`. Categorías para evitar duplicados obvios.
2. **Reservar / liberar un ítem** aportando nombre (visible solo para admin).
3. **Mensajes para el bebé:** cualquiera deja un mensaje firmado con su nombre.
4. **Info del evento:** fecha, hora y botón a Google Maps con la ubicación.
5. **Vista admin** protegida: ver reservas con nombres, marcar como recibido, agregar/editar/eliminar ítems y mensajes.

### Fuera de alcance (explícito)

- RSVP / confirmación de asistencia (si se decide incluir, modifica la constitution).
- Galería de fotos post-evento.
- Compra directa / integraciones con tiendas.
- Multi-evento o reutilización para otros baby showers.

---

## Gobernanza

- Toda feature nueva se evalúa contra los principios I–VII antes de entrar al `/specify`.
- Un cambio de principio o restricción técnica requiere bump de versión de este documento y nota en el changelog abajo.
- Si durante implementación se descubre que un principio es inviable, se **pausa** y se discute, no se viola silenciosamente.

---

## Changelog

- **0.2.0 (2026-10-24):** Confirma contexto del evento (Juan José, Tatiana y Julián, 21-nov-2026). Mensajes para el bebé muestran nombre públicamente. "Ya lo tenemos" es exclusivo del admin. Mapa como link externo a Google Maps en lugar de embed.
- **0.1.0 (2026-10-24):** Borrador inicial.
