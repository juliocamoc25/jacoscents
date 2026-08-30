import React from "react";
import { Droplet, ShoppingCart, Package2, Pencil, Copy, Trash2 } from "lucide-react";
import { money } from "../utils";
import { Badge } from "./UI";

export default function PerfumeCard({ perfume, onEdit, onDelete, onDuplicate, onAjustar, onAddCart }) {
  const stockBajo = perfume.cantidadDisponible <= (perfume.cantidadMinima || 0);
  const agotado = perfume.cantidadDisponible === 0;
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-300 transition-colors">
      <div className="aspect-square bg-neutral-50 flex items-center justify-center relative">
        <Droplet size={32} className="text-neutral-200" />
        {perfume.imagenUrl && (
          <img
            src={perfume.imagenUrl}
            alt={perfume.nombre}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        {!perfume.activo && <span className="absolute top-2 left-2 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded-full">Inactivo</span>}
        {perfume.destacado && <span className="absolute bottom-2 left-2 bg-gold-500 text-ink text-[10px] px-2 py-0.5 rounded-full font-semibold">★ Destacado</span>}
        {perfume.decant?.habilitado && <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">Decants</span>}
      </div>
      <div className="p-3">
        <p className="text-[11px] text-neutral-400 uppercase tracking-wide truncate">{perfume.marca || perfume.casaPerfumera || "—"}</p>
        <h4 className="text-sm font-semibold text-neutral-900 truncate mb-1">{perfume.nombre}</h4>
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-sm font-bold">{money(perfume.precioVenta)}</span>
          <Badge tone={agotado ? "error" : stockBajo ? "warning" : "neutral"}>{agotado ? "Agotado" : `${perfume.cantidadDisponible} en stock`}</Badge>
        </div>
        <div className="flex items-center gap-1 pt-2 border-t border-neutral-100">
          <button onClick={() => onAddCart(perfume)} disabled={agotado} title="Agregar a venta" className="flex-1 py-1.5 rounded-md bg-black text-white text-xs font-medium hover:bg-neutral-800 disabled:opacity-30 flex items-center justify-center gap-1">
            <ShoppingCart size={12} /> Vender
          </button>
          <button onClick={() => onAjustar(perfume)} title="Ajustar inventario" aria-label="Ajustar inventario" className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500"><Package2 size={14} /></button>
          <button onClick={() => onEdit(perfume)} title="Editar" aria-label="Editar" className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500"><Pencil size={14} /></button>
          <button onClick={() => onDuplicate(perfume)} title="Duplicar" aria-label="Duplicar" className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500"><Copy size={14} /></button>
          <button onClick={() => onDelete(perfume)} title="Eliminar" aria-label="Eliminar" className="p-1.5 rounded-md hover:bg-red-50 text-neutral-500 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}
