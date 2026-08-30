import React, { useMemo, useState } from "react";
import { Package, Plus, Search, Upload } from "lucide-react";
import PerfumeCard from "../PerfumeCard";
import { EmptyState } from "../common";
import { GENEROS } from "../../constants";

export default function CatalogoTab({ perfumes, onAdd, onEdit, onDelete, onDuplicate, onAjustar, onAddCart, onImport }) {
  const [search, setSearch] = useState("");
  const [filtroGenero, setFiltroGenero] = useState("");

  const filtrados = useMemo(() => {
    const q = search.toLowerCase().trim();
    return perfumes.filter((p) => {
      const matchQ = !q || [p.nombre, p.marca, p.casaPerfumera, p.notas, p.inspiracion, p.sku, p.codigoBarras].filter(Boolean).some((f) => String(f).toLowerCase().includes(q));
      const matchGenero = !filtroGenero || p.genero === filtroGenero;
      return matchQ && matchGenero;
    });
  }, [perfumes, search, filtroGenero]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, marca, notas, SKU..." className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
        </div>
        <div className="flex gap-2">
          <select value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)} className="px-3 py-2.5 rounded-lg border border-neutral-300 text-sm text-neutral-600">
            <option value="">Todos los géneros</option>
            {GENEROS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <button onClick={onImport} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-50 whitespace-nowrap"><Upload size={16} /> Importar Excel</button>
          <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 whitespace-nowrap"><Plus size={16} /> Nuevo</button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        perfumes.length === 0 ? (
          <EmptyState icon={Package} title="Tu catálogo está vacío" subtitle="Agrega tu primer perfume para comenzar a administrar tu inventario." actionLabel="Agregar perfume" onAction={onAdd} />
        ) : (
          <p className="text-sm text-neutral-400 text-center py-14">No se encontraron perfumes con esa búsqueda.</p>
        )
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtrados.map((p) => <PerfumeCard key={p.id} perfume={p} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} onAjustar={onAjustar} onAddCart={onAddCart} />)}
        </div>
      )}
    </div>
  );
}
