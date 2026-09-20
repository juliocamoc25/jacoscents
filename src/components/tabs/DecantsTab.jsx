import React, { useMemo, useState } from "react";
import { Droplet, Plus, Search } from "lucide-react";
import DecantCard from "../DecantCard";
import { EmptyState } from "../common";

export default function DecantsTab({ perfumes, onAbrir, onVender, onGoTo, onToggleAgotadoManual, onToggleHabilitado }) {
  const [search, setSearch] = useState("");

  // Se muestran los decants activos Y los dados de baja (para poder reactivarlos
  // desde aquí); solo se excluyen los perfumes que nunca se han abierto en decant.
  const habilitados = perfumes.filter((p) => p.decant?.habilitado || (p.decant?.mlTotalAbierto || 0) > 0);

  const filtrados = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return habilitados;
    return habilitados.filter((p) => [p.nombre, p.marca, p.casaPerfumera].filter(Boolean).some((f) => String(f).toLowerCase().includes(q)));
  }, [habilitados, search]);

  const AddBar = () => (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
      <p className="text-xs text-neutral-500 max-w-md">Un decant nace de un perfume existente: ábrelo y activa "Venta en decants". Aquí verás y venderás todos los que ya estén activos.</p>
      <button onClick={() => onGoTo("catalogo")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 whitespace-nowrap shrink-0">
        <Plus size={16} /> Añadir decant (desde un perfume)
      </button>
    </div>
  );

  if (habilitados.length === 0) {
    return (
      <div>
        <AddBar />
        <EmptyState icon={Droplet} title="Aún no tienes perfumes en decants" subtitle="Activa la venta en decants desde la ficha de un perfume en el catálogo, sección 'Venta en decants'." actionLabel="Ir al catálogo" onAction={() => onGoTo("catalogo")} />
      </div>
    );
  }
  return (
    <div>
      <AddBar />
      <div className="relative max-w-md mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o marca..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
        />
      </div>
      {filtrados.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-14">No se encontraron decants con esa búsqueda.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtrados.map((p) => <DecantCard key={p.id} perfume={p} onAbrir={onAbrir} onVender={onVender} onToggleAgotadoManual={onToggleAgotadoManual} onToggleHabilitado={onToggleHabilitado} />)}
        </div>
      )}
    </div>
  );
}
