import React, { useMemo, useState } from "react";
import { Gem, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { money } from "../../utils";
import { EmptyState } from "../common";
import { Badge } from "../UI";

export default function AccesoriosTab({ accesorios, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");

  const filtrados = useMemo(() => {
    const q = search.toLowerCase().trim();
    return accesorios.filter((a) => !q || [a.nombre, a.categoria, a.descripcion].filter(Boolean).some((f) => String(f).toLowerCase().includes(q)));
  }, [accesorios, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar accesorio..." className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
        </div>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 whitespace-nowrap"><Plus size={16} /> Nuevo accesorio</button>
      </div>

      {filtrados.length === 0 ? (
        accesorios.length === 0 ? (
          <EmptyState icon={Gem} title="Sin accesorios registrados" subtitle="Agrega decants de bolsillo, atomizadores, estuches y otros accesorios perfumeros." actionLabel="Agregar accesorio" onAction={onAdd} />
        ) : (
          <p className="text-sm text-neutral-400 text-center py-14">No se encontraron accesorios con esa búsqueda.</p>
        )
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtrados.map((a) => {
            const agotado = a.cantidadDisponible === 0;
            const stockBajo = a.cantidadDisponible <= (a.cantidadMinima || 0);
            return (
              <div key={a.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-300 transition-colors">
                <div className="aspect-square bg-neutral-50 flex items-center justify-center relative">
                  {a.imagenUrl ? (
                    <img src={a.imagenUrl} alt={a.nombre} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  ) : (
                    <Gem size={28} className="text-neutral-200" />
                  )}
                  {!a.activo && <span className="absolute top-2 left-2 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded-full">Inactivo</span>}
                </div>
                <div className="p-3">
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wide truncate">{a.categoria || "—"}</p>
                  <h4 className="text-sm font-semibold text-neutral-900 truncate mb-1">{a.nombre}</h4>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-sm font-bold">{money(a.precio)}</span>
                    <Badge tone={agotado ? "error" : stockBajo ? "warning" : "neutral"}>{agotado ? "Agotado" : `${a.cantidadDisponible} disp.`}</Badge>
                  </div>
                  <div className="flex items-center gap-1 pt-2 border-t border-neutral-100">
                    <button onClick={() => onEdit(a)} className="flex-1 py-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 text-xs font-medium flex items-center justify-center gap-1"><Pencil size={12} /> Editar</button>
                    <button onClick={() => onDelete(a)} aria-label="Eliminar accesorio" className="p-1.5 rounded-md hover:bg-red-50 text-neutral-500 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
