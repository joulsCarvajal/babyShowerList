import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

export const BOGOTA_TZ = "America/Bogota";

/** Interpreta "YYYY-MM-DDTHH:mm" como hora local de Bogotá y lo convierte a UTC. */
export function bogotaLocalToUtc(local: string): Date {
  return fromZonedTime(local, BOGOTA_TZ);
}

/** Formatea un Date UTC como "YYYY-MM-DDTHH:mm" en Bogotá — útil para inputs datetime-local. */
export function utcToBogotaLocalInput(date: Date): string {
  return formatInTimeZone(date, BOGOTA_TZ, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Formatea una fecha en zona horaria de Bogotá, en español.
 * Ejemplo: formatBogota(d, "EEEE d 'de' MMMM 'de' yyyy") -> "sábado 21 de noviembre de 2026"
 */
export function formatBogota(date: Date, pattern: string): string {
  return formatInTimeZone(date, BOGOTA_TZ, pattern, { locale: es });
}

/** "sábado 21 de noviembre · 3:00 p.m." */
export function formatEventoDisplay(date: Date): string {
  const fecha = formatBogota(date, "EEEE d 'de' MMMM");
  const hora = formatBogota(date, "h:mm a");
  // Capitaliza el día: "sábado" -> "Sábado"
  const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  return `${fechaCap} · ${hora}`;
}
