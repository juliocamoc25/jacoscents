import React from "react";
import { Droplet, Plus } from "lucide-react";
import DecantCard from "../DecantCard";
import { EmptyState } from "../common";

export default function DecantsTab({ perfumes, onAbrir, onVender, onGoTo }) {
  const habilitados = perfumes.filter((p) => p.decant?.habilitado);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {habilitados.map((p) => <DecantCard key={p.id} perfume={p} onAbrir={onAbrir} onVender={onVender} />)}
      </div>
    </div>
  );
}
