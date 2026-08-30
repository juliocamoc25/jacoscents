import { verifyPassword, issueToken, getLockoutStatus, registerFailedAttempt, resetLockout } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const lockout = await getLockoutStatus();
  if (lockout.locked) {
    return res.status(429).json({ error: "Demasiados intentos fallidos", lockout });
  }

  const { password } = req.body || {};
  const storedHash = process.env.ADMIN_PASSWORD_HASH || "";
  if (!storedHash) {
    return res.status(503).json({ error: "El panel no tiene contraseña configurada en el servidor (ADMIN_PASSWORD_HASH)." });
  }

  const ok = verifyPassword(password, storedHash);
  if (!ok) {
    const nuevoEstado = await registerFailedAttempt();
    return res.status(401).json({ error: "Contraseña incorrecta", lockout: nuevoEstado });
  }

  await resetLockout();
  const token = issueToken();
  return res.status(200).json({ token });
}
