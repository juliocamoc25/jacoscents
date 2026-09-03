import React, { useMemo, useState } from "react";
import { Search, Package } from "lucide-react";
import ProductPublicCard from "./ProductPublicCard";
import ProductDetailModal from "./ProductDetailModal";
import { EmptyState } from "../components/common";
import { GENEROS } from "../constants";
import { stockStateOf } from "../utils";
import { ProductFilters, useProductFilters } from "./ProductFilters";

export default function PerfumesPublicView({ perfumes, onAddToCart }) {
  const [search, setSearch] = useState("");
  const [genero, setGenero] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const filters = useProductFilters(perfumes);

  const visibles = useMemo(() => {
    const q = search.toLowerCase().trim();
    return perfumes.filter((p) => {
      if (p.activo === false) return false;
      if (!p.tieneFrascoCompleto) return false; // este catálogo es solo frascos completos; el resto vive en Decants
      const matchQ = !q || [p.nombre, p.marca, p.casaPerfumera, p.notas, p.notasSalida, p.notasCorazon, p.notasFondo].filter(Boolean).some((f) => String(f).toLowerCase().includes(q));
      const matchGenero = !genero || p.genero === genero;
      return matchQ && matchGenero && filters.apply(p);
    });
  }, [perfumes, search, genero, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-2">Catálogo completo</p>
        <h1 className="jaco-serif text-4xl font-semibold text-ink">Perfumes originales</h1>
        <p className="text-sm text-neutral-500 mt-2">Frascos completos, 100% originales y sellados.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar perfume o marca..." className="w-full pl-9 pr-3 py-2.5 rounded-full border border-bone-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setGenero("")} className={`px-3.5 py-2 rounded-full text-xs font-semibold border ${!genero ? "bg-ink text-white border-ink" : "border-bone-300 text-neutral-500"}`}>Todos</button>
          {GENEROS.map((g) => (
            <button key={g} onClick={() => setGenero(g)} className={`px-3.5 py-2 rounded-full text-xs font-semibold border ${genero === g ? "bg-ink text-white border-ink" : "border-bone-300 text-neutral-500"}`}>{g}</button>
          ))}
        </div>
      </div>

      <ProductFilters {...filters} />

      {visibles.length === 0 ? (
        <EmptyState icon={Package} title="No hay perfumes que coincidan" subtitle="Prueba con otra búsqueda o quita los filtros." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {visibles.map((p) => (
            <ProductPublicCard
              key={p.id}
              icon={Package}
              imagenUrl={p.imagenUrl}
              eyebrow={p.marca || p.casaPerfumera}
              title={p.nombre}
              description={p.notas}
              price={p.precioVenta}
              meta={p.presentacionMl ? `${p.presentacionMl} ml` : null}
              calificacion={p.calificacion}
              onAdd={onAddToCart ? () => onAddToCart({ kind: "perfume", id: p.id, tipo: "frasco", cantidad: 1, nombre: p.nombre, precioUnitario: p.precioVenta, imagenUrl: p.imagenUrl }) : null}
              stockState={stockStateOf(p.cantidadDisponible, p.cantidadMinima)}
              whatsappMessage={`Hola, me interesa el perfume "${p.nombre}"`}
              onClick={() => setSeleccionado(p)}
            />
          ))}
        </div>
      )}

      <ProductDetailModal
        open={!!seleccionado}
        onClose={() => setSeleccionado(null)}
        product={seleccionado ? {
          icon: Package,
          imagenUrl: seleccionado.imagenUrl,
          eyebrow: seleccionado.marca || seleccionado.casaPerfumera,
          title: seleccionado.nombre,
          description: seleccionado.descripcion,
          notas: seleccionado.notas,
          notasSalida: seleccionado.notasSalida,
          notasCorazon: seleccionado.notasCorazon,
          notasFondo: seleccionado.notasFondo,
          price: seleccionado.precioVenta,
          meta: [seleccionado.tipo, seleccionado.concentracion, seleccionado.presentacionMl ? `${seleccionado.presentacionMl} ml` : null].filter(Boolean).join(" · "),
          calificacion: seleccionado.calificacion,
          whatsappMessage: `Hola, me interesa el perfume "${seleccionado.nombre}"`,
        } : null}
      />
    </div>
  );
}
