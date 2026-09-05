import React, { useState } from "react";
import { X, Download, TrendingUp } from "lucide-react";
import { money, fmtDate } from "../../utils";
import { METODOS_PAGO, ESTADOS_VENTA } from "../../constants";
import { SectionCard, Field, NumberInput, TextInput, Badge, inputClass } from "../UI";

// Estimado del lado del cliente para mostrar "ganancia bruta/neta" mientras
// se arma la venta — el cálculo real y definitivo siempre lo hace el
// servidor al completar la venta (esto es solo una vista previa).
function costoDeItem(item, perfumes, accesorios) {
  if (item.kind === "accesorio") {
    const a = accesorios.find((x) => x.id === item.perfumeId);
    const costoUnit = a?.costoPromedio || a?.precioCompra || 0;
    return costoUnit * item.cantidad;
  }
  const p = perfumes.find((x) => x.id === item.perfumeId);
  if (!p) return 0;
  if (item.tipo === "frasco") {
    const costoUnit = p.costoPromedio || p.precioCompra || 0;
    return costoUnit * item.cantidad;
  }
  const costoPorMl = (p.costoPromedio || p.precioCompra || 0) / (p.presentacionMl || 1);
  return costoPorMl * item.cantidad;
}

export default function VentasTab({ carrito, clientes, perfumes, accesorios, onUpdateQty, onRemove, onCompletar, ventas, onVerTicket }) {
  const [clienteId, setClienteId] = useState("");
  const [agregandoCliente, setAgregandoCliente] = useState(false);
  const [clienteNuevoNombre, setClienteNuevoNombre] = useState("");
  const [descuento, setDescuento] = useState("");
  const [cupon, setCupon] = useState("");
  const [costoEnvio, setCostoEnvio] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [estado, setEstado] = useState("Pagado");
  const [completando, setCompletando] = useState(false);
  const [errorVenta, setErrorVenta] = useState("");

  const totalProductos = carrito.reduce((s, i) => s + (Number(i.cantidad) || 0), 0);
  const subtotal = carrito.reduce((s, i) => s + i.subtotal, 0);
  const costoTotalEstimado = carrito.reduce((s, i) => s + costoDeItem(i, perfumes, accesorios), 0);
  const gananciaBrutaEstimada = subtotal - costoTotalEstimado;
  const gananciaNetaEstimada = gananciaBrutaEstimada - (Number(descuento) || 0);
  const total = Math.max(0, subtotal - (Number(descuento) || 0) + (Number(costoEnvio) || 0));

  const handleCompletar = async () => {
    setCompletando(true);
    setErrorVenta("");
    try {
      const ok = await onCompletar({
        clienteId: agregandoCliente ? null : (clienteId || null),
        clienteInvitado: agregandoCliente && clienteNuevoNombre.trim() ? { nombre: clienteNuevoNombre.trim() } : null,
        descuento: Number(descuento) || 0,
        cupon,
        costoEnvio: Number(costoEnvio) || 0,
        metodoPago,
        estado,
      });
      if (ok) {
        setClienteId(""); setAgregandoCliente(false); setClienteNuevoNombre("");
        setDescuento(""); setCupon(""); setCostoEnvio(""); setMetodoPago("Efectivo"); setEstado("Pagado");
      } else {
        setErrorVenta("No se pudo registrar la venta. Intenta de nuevo.");
      }
    } catch (err) {
      setErrorVenta("Ocurrió un error al registrar la venta. Intenta de nuevo.");
    } finally {
      setCompletando(false);
    }
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
            Cliente: cli?.nombre || v.clienteInvitado?.nombre || "Mostrador",
            Productos: v.items.map((it) => `${it.nombrePerfume} x${it.cantidad}`).join(", "),
            "Método de pago": v.metodoPago,
            Estado: v.estado,
            Descuento: v.descuento || 0,
            "Costo de envío": v.costoEnvio || 0,
            "Ganancia bruta": v.gananciaBruta ?? "",
            "Ganancia neta": v.ganancia ?? "",
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
        <SectionCard title={`Productos en esta venta (${carrito.length})`}>
          {carrito.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">Agrega perfumes desde el Catálogo, decants desde la pestaña Decants, o accesorios desde su pestaña — cada tarjeta tiene un botón para agregarla aquí.</p>
          ) : (
            <div className="space-y-2">
              {carrito.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-800 truncate">{item.nombrePerfume}</p>
                    <p className="text-xs text-neutral-400">{item.tipo === "decant" ? `Decant · ${item.cantidad} ml` : `${item.cantidad} ${item.kind === "accesorio" ? "pieza(s)" : "frasco(s)"}`} · {money(item.precioUnitario)} c/u</p>
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
                  <button key={v.id} onClick={() => onVerTicket(v)} className="w-full flex items-center justify-between py-2.5 border-b border-neutral-100 last:border-0 text-left hover:bg-neutral-50 rounded-lg px-2 -mx-2">
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-800 truncate">{cli?.nombre || v.clienteInvitado?.nombre || "Mostrador"}{v.pedidoOrigenId && <span className="text-[10px] text-neutral-400 font-normal"> · desde pedido web</span>}</p>
                      <p className="text-xs text-neutral-400 truncate">{fmtDate(v.fecha)} · {v.items.length} producto(s){v.gananciaBruta != null && ` · ganancia ${money(v.ganancia)}`}</p>
                    </div>
                    <div className="text-right shrink-0 pl-2">
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
            <Field label="Cliente que compró">
              {!agregandoCliente ? (
                <div className="space-y-1.5">
                  <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className={inputClass}>
                    <option value="">Venta de mostrador (sin registrar cliente)</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => { setAgregandoCliente(true); setClienteId(""); }}
                    className="text-xs font-semibold text-neutral-500 hover:text-black"
                  >
                    + El cliente no está en la lista
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <TextInput
                    value={clienteNuevoNombre}
                    onChange={(e) => setClienteNuevoNombre(e.target.value)}
                    placeholder="Nombre del cliente nuevo"
                  />
                  <button
                    type="button"
                    onClick={() => { setAgregandoCliente(false); setClienteNuevoNombre(""); }}
                    className="text-xs font-semibold text-neutral-500 hover:text-black"
                  >
                    Elegir de la lista existente
                  </button>
                </div>
              )}
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
              <div className="flex justify-between text-sm text-neutral-500"><span>Productos</span><span>{carrito.length} producto(s) · {totalProductos} unidad(es)</span></div>
              <div className="flex justify-between text-sm text-neutral-500"><span>Precio de venta (subtotal)</span><span>{money(subtotal)}</span></div>
              {Number(descuento) > 0 && <div className="flex justify-between text-sm text-neutral-500"><span>Descuento</span><span>-{money(Number(descuento))}</span></div>}
              {Number(costoEnvio) > 0 && <div className="flex justify-between text-sm text-neutral-500"><span>Envío</span><span>{money(Number(costoEnvio))}</span></div>}
              <div className="flex justify-between text-lg font-bold pt-1"><span>Total a cobrar</span><span>{money(total)}</span></div>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5 space-y-1">
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest flex items-center gap-1"><TrendingUp size={11} /> Ganancia estimada</p>
              <div className="flex justify-between text-xs text-emerald-800"><span>Bruta (antes de descuento)</span><span className="font-semibold">{money(gananciaBrutaEstimada)}</span></div>
              <div className="flex justify-between text-xs text-emerald-800"><span>Neta (lo que realmente te queda)</span><span className="font-semibold">{money(gananciaNetaEstimada)}</span></div>
            </div>
            {errorVenta && <p className="text-xs text-red-600 text-center">{errorVenta}</p>}
            <button onClick={handleCompletar} disabled={carrito.length === 0 || completando} className="w-full py-3 rounded-lg bg-black text-white font-medium hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed">
              {completando ? "Registrando..." : "Completar venta"}
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
