// Autenticación de administrador, ahora del lado del servidor de verdad:
// la contraseña (o mejor dicho su hash) y el secreto para firmar sesiones
// NUNCA se mandan al navegador — solo existen aquí, en variables de entorno
// del servidor. Esto es lo que hace que el candado sea real y no solo una
// cortina, a diferencia de cuando todo vivía en el código del navegador.
import { pbkdf2Sync, randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import { getCollections } from "./db.js";

const SESSION_SECRET = process.env.SESSION_SECRET || "";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 20_000;

export function verifyPassword(password, stored) {
  if (!stored || !password) return false;
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[1], 10);
  if (!iterations || iterations < 10000) return false;
  try {
    const salt = Buffer.from(parts[2], "hex");
    const expected = Buffer.from(parts[3], "hex");
    const derived = pbkdf2Sync(password, salt, iterations, 32, "sha256");
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function issueToken() {
  if (!SESSION_SECRET) throw new Error("Falta SESSION_SECRET");
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const sig = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (!SESSION_SECRET || !token || typeof token !== "string") return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

// Extrae y valida el token "Authorization: Bearer <token>" de una petición
// de Vercel. Regresa true/false — no distinguimos el motivo al cliente para
// no dar pistas a quien intente forzar el acceso.
export function isAuthorized(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  return verifyToken(token);
}

/* ---- Control de intentos fallidos (guardado en la propia base de datos,
   así funciona igual sin importar en qué servidor caiga la función) ---- */
const LOCKOUT_DOC_ID = "admin_lockout";

export async function getLockoutStatus() {
  const { seguridad } = await getCollections();
  const doc = await seguridad.findOne({ _id: LOCKOUT_DOC_ID });
  const now = Date.now();
  if (doc && doc.lockedUntil > now) {
    return { locked: true, remainingMs: doc.lockedUntil - now, attemptsLeft: 0 };
  }
  return { locked: false, remainingMs: 0, attemptsLeft: Math.max(0, MAX_ATTEMPTS - (doc?.attempts || 0)) };
}

export async function registerFailedAttempt() {
  const { seguridad } = await getCollections();
  const doc = (await seguridad.findOne({ _id: LOCKOUT_DOC_ID })) || { attempts: 0, lockedUntil: 0, strikes: 0 };
  const now = Date.now();
  const attempts = doc.attempts + 1;
  let update;
  if (attempts >= MAX_ATTEMPTS) {
    const strikes = (doc.strikes || 0) + 1;
    const lockedUntil = now + BASE_LOCKOUT_MS * Math.pow(2, strikes - 1);
    update = { attempts: 0, lockedUntil, strikes };
  } else {
    update = { ...doc, attempts };
  }
  await seguridad.updateOne({ _id: LOCKOUT_DOC_ID }, { $set: update }, { upsert: true });
  return getLockoutStatus();
}

export async function resetLockout() {
  const { seguridad } = await getCollections();
  await seguridad.updateOne({ _id: LOCKOUT_DOC_ID }, { $set: { attempts: 0, lockedUntil: 0, strikes: 0 } }, { upsert: true });
}

export function randomId(prefix = "") {
  return prefix + randomBytes(9).toString("base64url");
}
