import React, { useMemo, useState } from "react";
import { Search, Gem } from "lucide-react";
import ProductPublicCard from "./ProductPublicCard";
import ProductDetailModal from "./ProductDetailModal";
import { EmptyState } from "../components/common";
import { ACCESORIO_CATEGORIAS } from "../constants";
import { stockStateOf } from "../utils";

export default function AccesoriosPublicView({ accesorios, onAddToCart }) {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);

  const visibles = useMemo(() => {
    const q = search.toLowerCase().trim();
    return accesorios.filter((a) => {
      if (a.activo === false) return false;
      const matchQ = !q || [a.nombre, a.descripcion].filter(Boolean).some((f) => String(f).toLowerCase().includes(q));
      const matchCat = !categoria || a.categoria === categoria;
      return matchQ && matchCat;
    });
  }, [accesorios, search, categoria]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-2">Complementos</p>
        <h1 className="jaco-serif text-4xl font-semibold text-ink">Accesorios perfumeros</h1>
        <p className="text-sm text-neutral-500 mt-2">Decants de bolsillo, atomizadores y sets para llevar tu fragancia a donde vayas.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar accesorio..." className="w-full pl-9 pr-3 py-2.5 rounded-full border border-bone-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white" />
        </div>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="px-3.5 py-2.5 rounded-full border border-bone-300 text-sm text-neutral-600 bg-white">
          <option value="">Todas las categorías</option>
          {ACCESORIO_CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {visibles.length === 0 ? (
        <EmptyState icon={Gem} title="No hay accesorios que coincidan" subtitle="Prueba con otra búsqueda o categoría." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {visibles.map((a) => (
            <ProductPublicCard
              key={a.id}
              icon={Gem}
              imagenUrl={a.imagenUrl}
              eyebrow={a.categoria}
              title={a.nombre}
              description={a.descripcion}
              price={a.precio}
              stockState={stockStateOf(a.cantidadDisponible, a.cantidadMinima)}
              whatsappMessage={`Hola, me interesa "${a.nombre}"`}
              onAdd={onAddToCart ? () => onAddToCart({ kind: "accesorio", id: a.id, tipo: "frasco", cantidad: 1, nombre: a.nombre, precioUnitario: a.precio, imagenUrl: a.imagenUrl }) : null}
              onClick={() => setSeleccionado(a)}
            />
          ))}
        </div>
      )}

      <ProductDetailModal
        open={!!seleccionado}
        onClose={() => setSeleccionado(null)}
        product={seleccionado ? {
          icon: Gem,
          imagenUrl: seleccionado.imagenUrl,
          eyebrow: seleccionado.categoria,
          title: seleccionado.nombre,
          description: seleccionado.descripcion,
          price: seleccionado.precio,
          whatsappMessage: `Hola, me interesa "${seleccionado.nombre}"`,
        } : null}
      />
    </div>
  );
}
