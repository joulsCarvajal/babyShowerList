/**
 * Rate limit en memoria para el login del admin.
 *
 * Reglas (spec HU-6): 5 intentos fallidos en 10 min desde la misma IP → bloqueo 15 min.
 *
 * Al ser in-memory, se resetea con cada reinicio del proceso. Es intencional:
 * una sola instancia en Railway, tráfico esperado < 80 personas, no necesita Redis.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000;

type Entry = {
  attempts: number;
  windowStartedAt: number;
  blockedUntil?: number;
};

const store = new Map<string, Entry>();

export type RateCheck =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSec: number };

/** Chequea si una IP puede intentar login. No muta el estado. */
export function checkRate(ip: string, now = Date.now()): RateCheck {
  const entry = store.get(ip);
  if (!entry) return { allowed: true, remaining: MAX_ATTEMPTS };

  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  if (now - entry.windowStartedAt > WINDOW_MS) {
    // Ventana expirada, se reseteará en el próximo registerFailure.
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - entry.attempts };
}

/** Registra un intento fallido. Bloquea si se superó el límite. */
export function registerFailure(ip: string, now = Date.now()): void {
  const entry = store.get(ip);

  if (!entry || now - entry.windowStartedAt > WINDOW_MS) {
    store.set(ip, { attempts: 1, windowStartedAt: now });
    return;
  }

  entry.attempts += 1;
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_MS;
  }
}

/** Limpia el registro de la IP tras login exitoso. */
export function clearRate(ip: string): void {
  store.delete(ip);
}

/** Devuelve la IP del request a partir de headers (Railway usa x-forwarded-for). */
export function getIpFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
