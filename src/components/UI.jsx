import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cx } from "../utils";

// Bloquea el scroll del fondo mientras un modal/diálogo está abierto, y lo
// restaura al cerrarlo. Sin esto, en algunos navegadores móviles la página
// de atrás se sigue moviendo detrás del overlay y da la sensación de que
// "no pasó nada" hasta hacer scroll.
function useLockBodyScroll(locked) {
  React.useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}

export const inputClass =
  "w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder:text-neutral-400 bg-white";

export function Field({ label, required, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder = "" }) {
  return <input type="text" value={value ?? ""} onChange={onChange} placeholder={placeholder} className={inputClass} />;
}

export function NumberInput({ value, onChange, prefix }) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{prefix}</span>}
      <input type="number" value={value ?? ""} onChange={onChange} className={cx(inputClass, prefix && "pl-7")} />
    </div>
  );
}

export function SelectInput({ value, onChange, options }) {
  return (
    <select value={value ?? ""} onChange={onChange} className={inputClass}>
      <option value="">Seleccionar...</option>
      {options.map((o) => (
        <option key={o} value={o}>{typeof o === "number" ? `${o} ml` : o}</option>
      ))}
    </select>
  );
}

export function TextArea({ value, onChange, rows = 3, placeholder = "" }) {
  return <textarea value={value ?? ""} onChange={onChange} rows={rows} placeholder={placeholder} className={inputClass} />;
}

export function FormSection({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-3">{title}</h4>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-600",
    success: "bg-neutral-900 text-white",
    error: "bg-red-50 text-red-600 border border-red-200",
    warning: "bg-red-600 text-white",
  };
  return <span className={cx("px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", tones[tone])}>{children}</span>;
}

export function StatCard({ icon: Icon, label, value, tone = "default" }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">{label}</span>
        <div className={cx("w-7 h-7 rounded-full flex items-center justify-center shrink-0", tone === "accent" ? "bg-red-600 text-white" : "bg-neutral-100 text-neutral-900")}>
          <Icon size={14} />
        </div>
      </div>
      <p className="text-xl font-bold text-neutral-900 tracking-tight truncate">{value}</p>
    </div>
  );
}

export function SectionCard({ title, children, action }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useLockBodyScroll(open);
  if (!open) return null;
  // Se monta con un portal directo a <body>: así el overlay "fixed" siempre
  // se centra en la pantalla que el usuario tiene enfrente, sin importar en
  // qué parte de una página larga esté montado el componente ni cuánto
  // scroll lleve acumulado.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className={cx("bg-white w-full max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl", maxWidth)}>
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-5 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">{title}</h3>
          <button onClick={onClose} aria-label="Cerrar" className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  useLockBodyScroll(open);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700">Eliminar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ToastView({ toast }) {
  if (!toast) return null;
  return createPortal(
    <div className={cx("fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-full shadow-lg text-sm font-medium", toast.type === "error" ? "bg-red-600 text-white" : "bg-black text-white")}>
      {toast.msg}
    </div>,
    document.body
  );
}

export function BottleGauge({ pct }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="flex flex-col items-center shrink-0 pt-1">
      <div className="w-2.5 h-2 bg-neutral-300 rounded-t-sm" />
      <div className="relative w-9 h-20 rounded-b-xl rounded-t-md border-2 border-neutral-200 overflow-hidden bg-neutral-50">
        <div className="absolute bottom-0 left-0 right-0 bg-red-600 transition-all duration-700 ease-out" style={{ height: `${clamped}%` }} />
      </div>
      <span className="text-[10px] text-neutral-400 mt-1">{Math.round(clamped)}%</span>
    </div>
  );
}
