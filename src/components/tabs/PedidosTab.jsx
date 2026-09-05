import React from "react";
import { ShoppingBag, Phone, MapPin, CreditCard, Check, Trash2, Receipt } from "lucide-react";
import { EmptyState } from "../common";
import { money, fmtDate } from "../../utils";

export default function PedidosTab({ pedidosWeb, onConvertirEnVenta, onCancelar, onEliminar }) {
  const pendientes = pedidosWeb.filter((p) => p.estado === "pendiente");
  const resueltos = pedidosWeb.filter((p) => p.estado !== "pendiente");

  if (pedidosWeb.length === 0) {
    return <EmptyState icon={ShoppingBag} title="Aún no llegan pedidos de la tienda" subtitle="Cuando un cliente arme un pedido en el carrito de la tienda pública y lo envíe, aparecerá aquí con sus productos y datos de envío." />;
  }

  const Pedido = ({ p }) => (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-ink">{p.envio?.nombre}</p>
          <p className="text-xs text-neutral-400">{fmtDate(p.fecha)}</p>
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${p.estado === "pendiente" ? "bg-amber-50 text-amber-700" : p.estado === "cancelado" ? "bg-neutral-100 text-neutral-500" : "bg-green-50 text-green-700"}`}>
          {p.estado === "pendiente" ? "Pendiente" : p.estado === "cancelado" ? "Cancelado" : "Venta registrada"}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        {p.items.map((it, i) => (
          <div key={i} className="flex justify-between text-xs text-neutral-600">
            <span>{it.nombre} {it.tipo === "decant" ? `(${it.ml}ml) x${it.cantidad}` : `x${it.cantidad}`}</span>
            <span>{money(it.precioUnitario * it.cantidad)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm font-semibold text-ink mb-3 pt-2 border-t border-neutral-100">
        <span>Total</span>
        <span>{money(p.total)}</span>
      </div>

      <div className="space-y-1 text-xs text-neutral-500 mb-3">
        <p className="flex items-center gap-1.5"><Phone size={12} /> {p.envio?.telefono}</p>
        <p className="flex items-center gap-1.5">
          <MapPin size={12} />
          {[p.envio?.direccion, p.envio?.colonia, p.envio?.ciudad, p.envio?.codigoPostal].filter(Boolean).join(", ")}
        </p>
        {p.envio?.referencias && <p className="pl-[18px] text-neutral-400">Referencias: {p.envio.referencias}</p>}
        <p className="flex items-center gap-1.5"><CreditCard size={12} /> {p.envio?.metodoPago}</p>
        {p.envio?.notas && <p className="italic">"{p.envio.notas}"</p>}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-2 border-t border-neutral-100">
        {p.estado === "pendiente" && (
          <>
            <button onClick={() => onConvertirEnVenta(p)} className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800">
              <Receipt size={13} /> Confirmar venta
            </button>
            <button onClick={() => onCancelar(p)} className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-neutral-600">
              <Check size={13} /> Cancelar
            </button>
          </>
        )}
        <button onClick={() => onEliminar(p)} className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-wine-600 ml-auto">
          <Trash2 size={13} /> Eliminar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <p className="text-xs text-neutral-400 -mt-1">"Confirmar venta" descuenta el inventario automáticamente y la registra en tu pestaña de Ventas — úsalo en cuanto el cliente te confirme el pago.</p>
      {pendientes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Pendientes ({pendientes.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendientes.map((p) => <Pedido key={p.id} p={p} />)}
          </div>
        </div>
      )}
      {resueltos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Resueltos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {resueltos.map((p) => <Pedido key={p.id} p={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
