import React, { useMemo, useState } from "react";
import { Users, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { money, fmtDate } from "../../utils";
import { EmptyState } from "../common";
import { Modal } from "../UI";

export default function ClientesTab({ clientes, ventas, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [detalle, setDetalle] = useState(null);

  const conStats = useMemo(() => clientes.map((c) => {
    const compras = ventas.filter((v) => v.clienteId === c.id);
    const total = compras.reduce((s, v) => s + v.total, 0);
    const ultima = compras.length ? compras.reduce((a, b) => new Date(a.fecha) > new Date(b.fecha) ? a : b).fecha : null;
    const conteoPerfumes = {};
    compras.forEach((v) => v.items.forEach((it) => { conteoPerfumes[it.nombrePerfume] = (conteoPerfumes[it.nombrePerfume] || 0) + 1; }));
    const favorito = Object.entries(conteoPerfumes).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    return { ...c, totalComprado: total, ultimaCompra: ultima, favorito, numCompras: compras.length };
  }), [clientes, ventas]);

  const filtrados = conStats.filter((c) => !search || [c.nombre, c.telefono, c.correo, c.instagram].filter(Boolean).some((f) => f.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente..." className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
        </div>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 whitespace-nowrap"><Plus size={16} /> Nuevo cliente</button>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={Users} title="Sin clientes registrados" subtitle="Agrega a tus clientes para llevar su historial de compras y favoritos." actionLabel="Agregar cliente" onAction={onAdd} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtrados.map((c) => (
            <div key={c.id} className="bg-white border border-neutral-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 truncate">{c.nombre}</h4>
                  <p className="text-xs text-neutral-400 truncate">{c.telefono || c.correo || "—"}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onEdit(c)} aria-label="Editar cliente" className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500"><Pencil size={13} /></button>
                  <button onClick={() => onDelete(c)} aria-label="Eliminar cliente" className="p-1.5 rounded-md hover:bg-red-50 text-neutral-500 hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="text-xs text-neutral-500 space-y-1 mb-3">
                {c.favorito && <p className="truncate">Favorito: <span className="text-neutral-700">{c.favorito}</span></p>}
                {c.ultimaCompra && <p>Última compra: {fmtDate(c.ultimaCompra)}</p>}
              </div>
              <button onClick={() => setDetalle(c)} className="w-full text-xs text-center py-1.5 rounded-md border border-neutral-200 text-neutral-600 hover:border-black">Ver historial</button>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-neutral-400">{c.numCompras} compra(s)</span>
                <span className="font-bold">{money(c.totalComprado)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!detalle} onClose={() => setDetalle(null)} title={detalle?.nombre || ""} maxWidth="max-w-md">
        {detalle && (
          <div className="space-y-3 text-sm">
            {detalle.telefono && <p className="text-neutral-600">Tel. {detalle.telefono}</p>}
            {detalle.correo && <p className="text-neutral-600">{detalle.correo}</p>}
            {detalle.ciudad && <p className="text-neutral-600">{detalle.ciudad}{detalle.estado ? ", " + detalle.estado : ""}</p>}
            <div className="pt-3 border-t border-neutral-200">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Historial de compras</p>
              {ventas.filter((v) => v.clienteId === detalle.id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((v) => (
                <div key={v.id} className="flex justify-between py-1.5 border-b border-neutral-100 last:border-0">
                  <span className="text-neutral-600">{fmtDate(v.fecha)}</span>
                  <span className="font-medium">{money(v.total)}</span>
                </div>
              ))}
              {ventas.filter((v) => v.clienteId === detalle.id).length === 0 && <p className="text-neutral-400">Sin compras registradas aún.</p>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
