# Spec 001 — MVP Baby Shower de Juan José

**Versión:** 1.0.0
**Fecha:** 2026-10-24
**Estado:** aprobado — listo para `/plan`
**Constitution:** v0.2.0

Este documento describe **qué** construye el MVP. El **cómo** (stack, estructura de código, deploy) se decide en `/plan`.

---

## 1. Objetivo

Un sitio web que los invitados abren desde WhatsApp para:
1. Ver la lista de regalos que necesitamos y reservar uno sin que otros invitados sepan quién lo reservó.
2. Dejar un mensaje público para Juan José.
3. Ver cuándo, dónde y a qué hora es el baby shower.

Y que Tatiana y Julián puedan administrar todo desde una vista protegida con contraseña.

---

## 2. Personas

### Invitado
Familiar o amigo cercano. Abre el link de WhatsApp desde el celular. No tiene cuenta. Puede escribir su nombre. No tiene conocimientos técnicos. Quiere resolver rápido: ver qué falta, elegir uno, y listo.

### Admin (Tatiana / Julián)
Dueños del evento. Conocen la contraseña única del admin. Entran desde celular o laptop. Agregan ítems a la lista, marcan los que ya tienen, ven quién reservó qué, y marcan ítems como recibidos cuando llegan los regalos.

---

## 3. Historias de usuario y criterios de aceptación

### HU-1 — Ver la lista de regalos (invitado)
**Como** invitado  
**Quiero** ver la lista de regalos agrupada por categoría  
**Para** elegir qué regalar sin duplicar lo que ya tienen

**Criterios de aceptación:**
- La página de inicio muestra la lista completa de ítems.
- Cada ítem muestra: nombre, categoría, estado (disponible / reservado / ya lo tenemos), y opcionalmente nota corta (talla, color, link de referencia).
- Los ítems "ya lo tenemos" se muestran visualmente diferenciados (ej. tachados, atenuados) para que el invitado vea el panorama completo y entienda qué cubrir.
- Los ítems "reservado" indican que están tomados, **sin revelar por quién**.
- Hay un contador o resumen arriba: `X disponibles · Y reservados · Z ya los tenemos`.
- Carga completa en ≤ 2 segundos en 4G.

### HU-2 — Reservar un regalo (invitado)
**Como** invitado  
**Quiero** marcar que yo voy a regalar un ítem disponible  
**Para** evitar que otro lo compre también

**Criterios de aceptación:**
- Solo los ítems en estado `disponible` tienen botón "Lo regalo yo".
- Al pulsarlo, se abre un formulario pidiendo **nombre** (obligatorio, mínimo 2 caracteres) y opcionalmente un mensaje corto para los papás.
- Al confirmar, el ítem pasa a estado `reservado` y desaparece el botón "Lo regalo yo" para cualquier otro invitado.
- El invitado ve una confirmación visual ("¡Gracias, {nombre}!") y la opción de **liberar** la reserva en caso de arrepentimiento.
- La reserva queda asociada a una **cookie / token local** en el navegador del invitado, para que solo él pueda liberarla desde la vista pública (sin necesidad de login).
- Si pierde la cookie, no puede liberar su reserva desde la vista pública; debe pedírselo al admin.

### HU-3 — Liberar una reserva propia (invitado)
**Como** invitado que reservó un ítem  
**Quiero** liberarlo si cambié de idea  
**Para** no bloquear a otros

**Criterios de aceptación:**
- Si el navegador tiene el token de una reserva, el ítem reservado muestra botón "Ya no podré regalarlo".
- Al pulsarlo y confirmar, el ítem vuelve a `disponible` y la reserva queda registrada como `liberada` en admin (no se borra, para auditoría).

### HU-4 — Dejar un mensaje para Juan José
**Como** invitado  
**Quiero** dejar un mensaje de cariño firmado con mi nombre  
**Para** que la familia lo guarde como recuerdo

**Criterios de aceptación:**
- Hay una sección "Mensajes para Juan José" con los mensajes existentes, ordenados del más reciente al más antiguo.
- Cada mensaje muestra: nombre del autor, texto, y fecha (ej. "hace 2 días").
- Formulario para publicar un mensaje nuevo con campos: **nombre** (obligatorio, ≥ 2 chars) y **mensaje** (obligatorio, ≥ 5 chars, ≤ 500 chars).
- El mensaje aparece inmediatamente en la lista tras publicar.
- Un invitado no puede editar ni borrar mensajes desde la vista pública (solo admin).

### HU-5 — Ver info del evento
**Como** invitado  
**Quiero** ver fecha, hora y lugar  
**Para** llegar al evento

**Criterios de aceptación:**
- Se muestra claramente: fecha (21 de noviembre de 2026), hora, dirección en texto.
- Botón "Ver ubicación en Google Maps" que abre la URL configurada por admin en una pestaña nueva.
- Visible en la página principal, en la zona alta ("above the fold" en móvil).

### HU-6 — Entrar al admin
**Como** admin  
**Quiero** acceder a una vista protegida con contraseña  
**Para** gestionar ítems, reservas y mensajes

**Criterios de aceptación:**
- Ruta `/admin` muestra formulario con un solo campo de contraseña.
- Contraseña se compara contra variable de entorno `ADMIN_PASSWORD`.
- Al autenticar, se crea una sesión por cookie firmada con expiración de 7 días.
- Tras 5 intentos fallidos desde la misma IP en 10 minutos, se bloquea por 15 min (rate limiting mínimo).
- Botón "Cerrar sesión" visible en toda la vista admin.

### HU-7 — Gestionar ítems (admin)
**Como** admin  
**Quiero** agregar, editar, eliminar ítems y cambiar su estado  
**Para** mantener la lista alineada con lo que realmente necesitamos y tenemos

**Criterios de aceptación:**
- Vista `/admin/items`: tabla con todos los ítems y sus estados.
- Puedo crear un ítem con: nombre, categoría, nota opcional (texto libre), link de referencia opcional (URL).
- Puedo editar cualquier campo de un ítem.
- Puedo marcar un ítem como `ya lo tenemos` o devolverlo a `disponible` con un clic. Esto es exclusivo de admin.
- Puedo eliminar un ítem. Si tiene reserva activa, el sistema pide confirmación explícita y notifica que la reserva se perderá.
- Las categorías son texto libre (no hay catálogo cerrado). Para evitar typos, el formulario sugiere categorías ya existentes como autocompletar.

### HU-8 — Ver reservas con nombres (admin)
**Como** admin  
**Quiero** ver quién reservó cada ítem  
**Para** agradecer y saber qué esperar

**Criterios de aceptación:**
- Vista `/admin/reservas`: lista de reservas activas con: ítem, nombre de quien reservó, fecha, mensaje opcional dejado al reservar.
- Puedo marcar una reserva como **recibida** (= el regalo llegó físicamente). El ítem queda `recibido` y no vuelve a `disponible`.
- Puedo cancelar una reserva (vuelve el ítem a `disponible`). Útil si el invitado me avisa por fuera.
- Veo también un historial de reservas liberadas por los propios invitados (solo lectura).

### HU-9 — Moderar mensajes (admin)
**Como** admin  
**Quiero** editar o borrar mensajes  
**Para** corregir errores o quitar algo inapropiado

**Criterios de aceptación:**
- Vista `/admin/mensajes`: lista completa, con botones editar y borrar por mensaje.
- Borrar pide confirmación. No hay soft delete: se borra definitivo (es contenido no crítico).

### HU-10 — Configurar info del evento (admin)
**Como** admin  
**Quiero** editar la fecha, hora, dirección y URL de Google Maps  
**Para** corregir sin redeploy

**Criterios de aceptación:**
- Vista `/admin/evento`: formulario con los campos: fecha, hora, dirección (texto), URL de Google Maps.
- Al guardar, los cambios se reflejan inmediatamente en la vista pública.

---

## 4. Modelo de datos conceptual

> Nombres y tipos exactos se definen en `/plan`. Esto describe entidades y relaciones.

- **Item**
  - `id`, `nombre`, `categoria`, `nota`, `link_referencia`, `estado` (`disponible` | `reservado` | `ya_lo_tenemos` | `recibido`), `created_at`, `updated_at`.
- **Reserva**
  - `id`, `item_id`, `nombre_invitado`, `mensaje_opcional`, `token` (opaco, guardado en cookie del invitado), `estado` (`activa` | `liberada` | `cancelada_admin` | `recibida`), `created_at`, `updated_at`.
  - Invariante: un ítem tiene como máximo **una** reserva en estado `activa` a la vez.
- **Mensaje**
  - `id`, `nombre_autor`, `texto`, `created_at`.
- **ConfigEvento** (singleton)
  - `fecha_hora`, `direccion`, `url_maps`.
- **Sesión admin** (puede ser cookie firmada sin tabla, decisión en `/plan`).

### Reglas de estado del ítem

```
disponible --[reserva creada]--> reservado
reservado --[reserva liberada por invitado]--> disponible
reservado --[reserva cancelada por admin]--> disponible
reservado --[marcar recibido en admin]--> recibido
disponible --[admin marca como ya lo tenemos]--> ya_lo_tenemos
ya_lo_tenemos --[admin devuelve a lista]--> disponible
```

`recibido` es terminal: no vuelve a `disponible` (si fue un error se edita manualmente en DB).

---

## 5. Flujos principales

### Flujo A — Invitado reserva un regalo
1. Abre link en WhatsApp → aterriza en la portada con la lista.
2. Filtra visualmente por categoría o scrollea.
3. Encuentra un ítem disponible y pulsa "Lo regalo yo".
4. Modal pide nombre (y mensaje opcional). Confirma.
5. Ve pantalla de agradecimiento. El ítem queda `reservado`. Su navegador guarda el token.
6. (Opcional) Más tarde regresa al link y ve que su ítem está reservado por él; puede liberar.

### Flujo B — Admin agrega la lista inicial
1. Entra a `/admin` con contraseña.
2. Va a `/admin/items`, crea ítems uno por uno con categoría y notas.
3. Marca los que ya tiene como `ya lo tenemos`.
4. Verifica la vista pública en otra pestaña.

### Flujo C — Admin recibe regalos el día del evento
1. Entra a `/admin/reservas`.
2. Por cada regalo que llega físicamente, pulsa "marcar recibido".
3. Al final del evento, revisa los ítems que quedaron `disponibles` o `reservados` sin recibir.

---

## 6. Reglas de negocio clave

- Un invitado puede tener múltiples reservas activas simultáneas (puede regalar varios ítems). Cada una con su propio token.
- Si un invitado reserva desde dos dispositivos distintos con el mismo nombre, se tratan como reservas separadas (los tokens son por navegador).
- Validación de nombres: trim, mínimo 2 caracteres, máximo 60. Permitidos letras, números, espacios, acentos, puntuación básica. No se normaliza para deduplicar: "Ana" y "ana" son nombres distintos a efectos de visualización.
- Validación mensaje al bebé: 5–500 caracteres, se preservan saltos de línea.
- Zona horaria: America/Bogota para todas las fechas mostradas.
- Idioma: español en todo el UI y mensajes.

---

## 7. Requisitos no funcionales

- **Rendimiento:** página principal < 2 s en 4G, < 500 ms en WiFi. Imagen Docker < 300 MB.
- **Disponibilidad:** basta "best effort" en Railway free/hobby tier. Sin SLA formal.
- **Capacidad esperada:** máximo ~80 invitados, ~150 ítems, ~200 mensajes. No necesita optimizarse más allá.
- **Seguridad:**
  - Admin protegido por contraseña única (env var) + rate limiting básico.
  - Cookie admin firmada (HMAC) con flag `HttpOnly` y `Secure`.
  - Sin PII sensible más allá de nombres y mensajes voluntarios.
  - `robots.txt: Disallow: /` + `<meta name="robots" content="noindex">`.
- **Privacidad:** no analytics, no trackers, no fonts externos que lleven telemetría.
- **Accesibilidad:** semántica HTML correcta, contraste AA, formularios con labels. No se persigue WCAG estricto pero no se bloquea con JS obligatorio para leer la lista.
- **Observabilidad:** logs básicos a stdout. No se requiere más.
- **Backup:** export manual de la DB (archivo) tras el evento. Opción de botón "exportar JSON" en admin es nice-to-have.

---

## 8. Fuera de alcance explícito

Reafirma la constitution:
- RSVP / confirmación de asistencia.
- Login o cuentas de invitados.
- Pagos, integración con tiendas, Amazon wishlist import.
- Galería de fotos del evento, antes o después.
- Notificaciones push, email o SMS.
- Multi-idioma.
- Multi-evento o versión reutilizable para otras familias.
- App móvil nativa.

---

## 9. Decisiones resueltas

1. **Acceso:** un único link público compartido por WhatsApp. Nombre se pide en cada reserva y en cada mensaje.
2. **Reservas múltiples con el mismo nombre:** agrupar visualmente en admin por nombre, pero cada reserva es una entidad separada en DB.
3. **Ítems "ya lo tenemos":** visibles por defecto (atenuados / tachados) con toggle "ocultar los que ya tenemos" para limpiar la vista en móvil.
4. **URL / dominio:** pendiente fuera del scope de código — por default subdominio de Railway, Julián decidirá si compra dominio propio.

---

## 10. Criterios de "listo para lanzar"

- [ ] HU-1 a HU-10 implementadas y probadas manualmente en móvil (iOS Safari + Android Chrome).
- [ ] Deploy Docker verde en Railway, DB persistente, variables de entorno configuradas.
- [ ] Lista inicial de ítems cargada por admin.
- [ ] URL de Google Maps configurada.
- [ ] `robots.txt` y meta noindex verificados.
- [ ] Prueba de humo del día: Tatiana y Julián entran al admin desde celular, hacen una reserva de prueba y la liberan.
- [ ] Link del sitio probado abriendo desde WhatsApp en celular real.
