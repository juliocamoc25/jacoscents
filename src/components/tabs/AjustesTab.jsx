import React, { useRef, useState } from "react";
import { Download, Upload, AlertTriangle, ShieldCheck, KeyRound, CheckCircle2, XCircle } from "lucide-react";
import { SectionCard } from "../UI";
import { WHATSAPP_NUMBER } from "../../constants";

const PLACEHOLDER_WHATSAPP = "5215500000000";
const AI_PROXY_URL = import.meta.env.VITE_AI_PROXY_URL;
const AI_PERFUME_LOOKUP_URL = import.meta.env.VITE_AI_PERFUME_LOOKUP_URL;

function ChecklistRow({ ok, label, detail }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      {ok ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" /> : <XCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />}
      <div>
        <p className="text-sm text-neutral-800">{label}</p>
        {!ok && detail && <p className="text-xs text-neutral-400 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className="text-sm font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

export default function AjustesTab({ perfumes, clientes, ventas, movimientos, accesorios, onExportar, onImportar, onBorrarTodo }) {
  const fileRef = useRef(null);
  const [importError, setImportError] = useState("");
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  const handleExportar = () => {
    const payload = onExportar();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fecha = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `jaco-scents-respaldo-${fecha}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const confirmar = window.confirm(
          "Esto reemplazará TODOS los datos actuales (perfumes, clientes, ventas, movimientos, accesorios) con los del archivo. ¿Continuar?"
        );
        if (confirmar) {
          const ok = await onImportar(parsed);
          if (!ok) setImportError("No se pudo restaurar el respaldo. Revisa tu conexión e intenta de nuevo.");
        }
      } catch {
        setImportError("El archivo no es un JSON válido de respaldo de JACO SCENTS.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <SectionCard title="Estado de los datos">
        <div className="space-y-1">
          <StatRow label="Perfumes" value={perfumes.length} />
          <StatRow label="Accesorios" value={accesorios.length} />
          <StatRow label="Clientes" value={clientes.length} />
          <StatRow label="Ventas registradas" value={ventas.length} />
          <StatRow label="Movimientos de inventario" value={movimientos.length} />
        </div>
        <p className="text-xs text-neutral-400 mt-3">Todo vive en tu base de datos en la nube (MongoDB Atlas) — se ve igual desde cualquier dispositivo, y no depende de este navegador ni de que tu computadora esté prendida. Aun así, conviene exportar un respaldo de vez en cuando como copia de seguridad extra.</p>
      </SectionCard>

      <SectionCard title="Configuración pendiente">
        <ChecklistRow
          ok={WHATSAPP_NUMBER !== PLACEHOLDER_WHATSAPP}
          label="Número de WhatsApp real configurado"
          detail="Sigues usando el número de ejemplo — los clientes no podrán contactarte. Cámbialo con VITE_WHATSAPP_NUMBER en tu .env."
        />
        <ChecklistRow
          ok={!!AI_PROXY_URL}
          label="Asistente IA conectado"
          detail="Sin VITE_AI_PROXY_URL, la pestaña Asistente IA no podrá responder. Ver README."
        />
        <ChecklistRow
          ok={!!AI_PERFUME_LOOKUP_URL}
          label="Buscador de perfumes conectado"
          detail="Sin VITE_AI_PERFUME_LOOKUP_URL, el autocompletado al agregar un perfume no funcionará. Ver README."
        />
      </SectionCard>

      <SectionCard title="Seguridad del acceso">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-neutral-800 font-medium">Acceso protegido por el servidor</p>
            <p className="text-xs text-neutral-500 mt-1">
              La contraseña se verifica en el servidor (nunca se manda al navegador) y se bloquea temporalmente tras varios
              intentos fallidos. Cada dispositivo que inicia sesión queda recordado por 30 días.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
          <KeyRound size={13} className="shrink-0" />
          <code>node scripts/generar-hash-admin.mjs</code>
        </div>
      </SectionCard>

      <SectionCard title="Respaldo de datos">
        <p className="text-sm text-neutral-500 mb-4">Descarga una copia de todo tu catálogo, clientes y ventas, o restaura un respaldo anterior.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleExportar} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800">
            <Download size={15} /> Exportar respaldo
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-50">
            <Upload size={15} /> Importar respaldo
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
        </div>
        {importError && <p className="text-xs text-red-600 mt-2">{importError}</p>}
      </SectionCard>

      <SectionCard title="Zona de riesgo">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-neutral-600">Borra permanentemente todo lo guardado en tu base de datos: perfumes, accesorios, clientes, ventas y movimientos. No se puede deshacer.</p>
        </div>
        {!confirmandoBorrado ? (
          <button onClick={() => setConfirmandoBorrado(true)} className="px-4 py-2.5 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50">
            Borrar todos los datos
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={async () => { await onBorrarTodo(); setConfirmandoBorrado(false); }}
              className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              Sí, borrar todo permanentemente
            </button>
            <button onClick={() => setConfirmandoBorrado(false)} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-50">
              Cancelar
            </button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
