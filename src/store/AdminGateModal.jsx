import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Lock, X, Loader2 } from "lucide-react";
import { login } from "../apiClient";

function formatRemaining(ms) {
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.ceil(s / 60)} min`;
}

export default function AdminGateModal({ open, onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [lockout, setLockout] = useState(null);

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setError("");
    setLockout(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (checking) return;
    setChecking(true);
    setError("");
    const result = await login(password);
    setChecking(false);

    if (result.ok) {
      setPassword("");
      onSuccess();
      return;
    }
    if (result.lockout?.locked) {
      setLockout(result.lockout);
      setError(`Demasiados intentos. Espera ${formatRemaining(result.lockout.remainingMs)}.`);
    } else {
      setError(result.lockout ? `Contraseña incorrecta. Te quedan ${result.lockout.attemptsLeft} intento(s).` : result.error);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-ink border border-gold-400/30 rounded-2xl shadow-lux max-w-sm w-full p-6 relative">
        <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X size={18} /></button>
        <div className="w-11 h-11 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center mb-4">
          <Lock size={18} className="text-gold-400" />
        </div>
        <h3 className="jaco-serif text-xl font-semibold text-white mb-1">Acceso administrador</h3>
        <p className="text-xs text-neutral-400 mb-4">Ingresa la contraseña para entrar al panel de administración.</p>

        {lockout?.locked ? (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-xs text-red-300">
            Demasiados intentos fallidos. Vuelve a intentarlo en <strong>{formatRemaining(lockout.remainingMs)}</strong>.
          </div>
        ) : (
          <>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Contraseña"
              className="w-full px-3 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            <button onClick={submit} disabled={checking} className="w-full mt-4 py-2.5 rounded-lg bg-gold-400 text-ink font-semibold text-sm hover:bg-gold-300 disabled:opacity-60 flex items-center justify-center gap-2">
              {checking && <Loader2 size={14} className="animate-spin" />}
              Entrar
            </button>
            <p className="text-[11px] text-neutral-500 mt-3 text-center">Una vez que entres, este dispositivo queda recordado por 30 días.</p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
