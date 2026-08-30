// Cliente para hablar con el backend (api/*.js en Vercel + MongoDB Atlas).
// El token de sesión se guarda en localStorage: una vez que inicias sesión
// en un dispositivo, no te lo vuelve a pedir hasta que expire (30 días) o
// cierres sesión manualmente — funciona igual en desarrollo y ya en línea.
const TOKEN_KEY = "jaco_admin_token";

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* noop */ }
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* noop */ }
}

async function parseJsonSafe(res) {
  try { return await res.json(); } catch { return null; }
}

export async function login(password) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) return { ok: false, error: data?.error || "No se pudo iniciar sesión", lockout: data?.lockout };
  setToken(data.token);
  return { ok: true };
}

export function logout() {
  clearToken();
}

export async function fetchPublicCatalog() {
  const res = await fetch("/api/public");
  if (!res.ok) throw new Error("No se pudo cargar el catálogo");
  return res.json();
}

export async function crearPedidoPublico(payload) {
  const res = await fetch("/api/public", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "crear-pedido", payload }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || "No se pudo enviar el pedido");
  return data.pedido;
}

export async function fetchAdminData() {
  const token = getToken();
  const res = await fetch("/api/admin", { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) { clearToken(); throw new Error("SESSION_EXPIRED"); }
  if (!res.ok) throw new Error("No se pudo cargar la información del panel");
  return res.json();
}

// Ejecuta una acción de escritura en el panel (guardar perfume, registrar
// venta, etc.) y regresa el set completo de datos ya actualizado.
export async function runAdminAction(action, payload) {
  const token = getToken();
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, payload }),
  });
  const data = await parseJsonSafe(res);
  if (res.status === 401) { clearToken(); throw new Error("SESSION_EXPIRED"); }
  if (!res.ok) throw new Error(data?.error || "No se pudo guardar. Intenta de nuevo.");
  return data;
}
