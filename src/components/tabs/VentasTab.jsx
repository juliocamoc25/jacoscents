import React, { useState } from "react";
import { X, Download } from "lucide-react";
import { money, fmtDate } from "../../utils";
import { METODOS_PAGO, ESTADOS_VENTA } from "../../constants";
import { SectionCard, Field, NumberInput, TextInput, Badge, inputClass } from "../UI";

export default function VentasTab({ carrito, clientes, onUpdateQty, onRemove, onCompletar, ventas, onVerTicket }) {
  const [clienteId, setClienteId] = useState("");
  const [descuento, setDescuento] = useState("");
  const [cupon, setCupon] = useState("");
  const [costoEnvio, setCostoEnvio] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [estado, setEstado] = useState("Pagado");

  const subtotal = carrito.reduce((s, i) => s + i.subtotal, 0);
  const total = Math.max(0, subtotal - (Number(descuento) || 0) + (Number(costoEnvio) || 0));

  const handleCompletar = () => {
    onCompletar({ clienteId: clienteId || null, descuento: Number(descuento) || 0, cupon, costoEnvio: Number(costoEnvio) || 0, metodoPago, estado });
    setClienteId(""); setDescuento(""); setCupon(""); setCostoEnvio(""); setMetodoPago("Efectivo"); setEstado("Pagado");
  };

  const historial = [...ventas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 15);

  const [exportando, setExportando] = useState(false);
  const exportarReporte = async () => {
    if (ventas.length === 0) return;
    setExportando(true);
    try {
      const XLSX = await import("xlsx");
      const filas = ventas
        .slice()
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .map((v) => {
          const cli = clientes.find((c) => c.id === v.clienteId);
          return {
            Fecha: fmtDate(v.fecha),
            Cliente: cli?.nombre || "Mostrador",
            Productos: v.items.map((it) => `${it.nombrePerfume} x${it.cantidad}`).join(", "),
            "Método de pago": v.metodoPago,
            Estado: v.estado,
            Descuento: v.descuento || 0,
            "Costo de envío": v.costoEnvio || 0,
            Total: v.total,
          };
        });
      const ws = XLSX.utils.json_to_sheet(filas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ventas");
      XLSX.writeFile(wb, `jaco-scents-ventas-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      // silencioso: si falla, el usuario puede reintentar
    }
    setExportando(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 space-y-4">
        <SectionCard title={`Carrito (${carrito.length})`}>
          {carrito.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">Agrega perfumes desde el Catálogo o decants desde la pestaña Decants.</p>
          ) : (
            <div className="space-y-2">
              {carrito.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-800 truncate">{item.nombrePerfume}</p>
                    <p className="text-xs text-neutral-400">{item.tipo === "decant" ? `Decant · ${item.cantidad} ml` : `${item.cantidad} frasco(s)`} · {money(item.precioUnitario)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.tipo === "frasco" && (
                      <div className="flex items-center gap-1 border border-neutral-200 rounded-lg">
                        <button onClick={() => onUpdateQty(i, -1)} aria-label="Restar cantidad" className="w-6 h-6 flex items-center justify-center text-neutral-500 hover:text-black">−</button>
                        <span className="text-xs w-4 text-center">{item.cantidad}</span>
                        <button onClick={() => onUpdateQty(i, 1)} aria-label="Sumar cantidad" className="w-6 h-6 flex items-center justify-center text-neutral-500 hover:text-black">+</button>
                      </div>
                    )}
                    <span className="text-sm font-semibold w-16 text-right">{money(item.subtotal)}</span>
                    <button onClick={() => onRemove(i)} aria-label="Quitar del carrito" className="p-1 text-neutral-400 hover:text-red-600"><X size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Historial de ventas"
          action={
            ventas.length > 0 && (
              <button onClick={exportarReporte} disabled={exportando} className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black disabled:opacity-50">
                <Download size={13} /> {exportando ? "Generando..." : "Exportar a Excel"}
              </button>
            )
          }
        >
          {historial.length === 0 ? <p className="text-sm text-neutral-400 py-4">Sin ventas registradas.</p> : (
            <div className="space-y-1">
              {historial.map((v) => {
                const cli = clientes.find((c) => c.id === v.clienteId);
                return (
                  <button key={v.id} onClick={() => onVerTicket(v)} className="w-full flex items-center justify-between py-2 border-b border-neutral-100 last:border-0 text-left hover:bg-neutral-50 rounded-lg px-2 -mx-2">
                    <div>
                      <p className="text-sm text-neutral-800">{cli?.nombre || "Mostrador"}</p>
                      <p className="text-xs text-neutral-400">{fmtDate(v.fecha)} · {v.items.length} producto(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{money(v.total)}</p>
                      <Badge tone={v.estado === "Pagado" ? "success" : v.estado === "Cancelado" ? "error" : "neutral"}>{v.estado}</Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="lg:col-span-2">
        <SectionCard title="Finalizar venta">
          <div className="space-y-3">
            <Field label="Cliente">
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className={inputClass}>
                <option value="">Venta de mostrador</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Descuento"><NumberInput value={descuento} onChange={(e) => setDescuento(e.target.value)} prefix="$" /></Field>
              <Field label="Envío"><NumberInput value={costoEnvio} onChange={(e) => setCostoEnvio(e.target.value)} prefix="$" /></Field>
            </div>
            <Field label="Cupón"><TextInput value={cupon} onChange={(e) => setCupon(e.target.value)} /></Field>
            <Field label="Método de pago">
              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className={inputClass}>
                {METODOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputClass}>
                {ESTADOS_VENTA.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <div className="pt-3 border-t border-neutral-200 space-y-1">
              <div className="flex justify-between text-sm text-neutral-500"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
            </div>
            <button onClick={handleCompletar} disabled={carrito.length === 0} className="w-full py-3 rounded-lg bg-black text-white font-medium hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed">Completar venta</button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
