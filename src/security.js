// Utilidades de saneamiento de datos del lado del navegador. La contraseña
// de administrador y el control de intentos fallidos ahora viven en el
// servidor (ver api/_lib/auth.js) — esto solo limpia lo que la gente escribe
// en los formularios antes de mandarlo al backend.

// Solo permite URLs http(s) o imágenes subidas localmente (data:image/...,
// generadas por nuestro propio componente de subida vía canvas — nunca
// texto arbitrario). Bloquea "javascript:", "data:text/html" y esquemas raros
// que podrían usarse para inyectar comportamiento inesperado.
export function sanitizeUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(trimmed)) {
    // Límite generoso pero real: evita que una imagen enorme sature la base de datos.
    return trimmed.length <= 2_000_000 ? trimmed : "";
  }
  if (trimmed.startsWith("/")) return trimmed; // ruta local dentro del proyecto (/img/...)
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return trimmed;
    return "";
  } catch {
    return "";
  }
}

export function sanitizeText(text, maxLen = 400) {
  return String(text ?? "").trim().slice(0, maxLen);
}

export function clampNumber(value, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
