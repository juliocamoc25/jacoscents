import React, { useMemo, useState } from "react";
import { Package, Gem, SearchX } from "lucide-react";
import ProductPublicCard from "./ProductPublicCard";
import ProductDetailModal from "./ProductDetailModal";
import { EmptyState } from "../components/common";
import { stockStateOf } from "../utils";

export default function BusquedaView({ query, perfumes, accesorios, onAddToCart }) {
  const [seleccionado, setSeleccionado] = useState(null);
  const q = query.toLowerCase().trim();

  const resultados = useMemo(() => {
    const dePerfumes = perfumes
      .filter((p) => p.activo !== false)
      .filter((p) => [p.nombre, p.marca, p.casaPerfumera, p.notas, p.descripcion].filter(Boolean).some((f) => String(f).toLowerCase().includes(q)))
      .map((p) => ({
        kind: "perfume", id: `p-${p.id}`, icon: Package, tipoLabel: "Perfume",
        imagenUrl: p.imagenUrl, eyebrow: p.marca || p.casaPerfumera, title: p.nombre,
        description: p.notas, price: p.precioVenta,
        meta: p.presentacionMl ? `${p.presentacionMl} ml` : null,
        calificacion: p.calificacion,
        stockState: stockStateOf(p.cantidadDisponible, p.cantidadMinima),
        whatsappMessage: `Hola, me interesa el perfume "${p.nombre}"`,
        onAdd: onAddToCart ? () => onAddToCart({ kind: "perfume", id: p.id, tipo: "frasco", cantidad: 1, nombre: p.nombre, precioUnitario: p.precioVenta, imagenUrl: p.imagenUrl }) : null,
        detalle: { icon: Package, imagenUrl: p.imagenUrl, eyebrow: p.marca || p.casaPerfumera, title: p.nombre, description: p.descripcion, notas: p.notas, price: p.precioVenta, meta: [p.tipo, p.concentracion, p.presentacionMl ? `${p.presentacionMl} ml` : null].filter(Boolean).join(" · "), calificacion: p.calificacion, whatsappMessage: `Hola, me interesa el perfume "${p.nombre}"` },
      }));

    const deAccesorios = accesorios
      .filter((a) => a.activo !== false)
      .filter((a) => [a.nombre, a.categoria, a.descripcion].filter(Boolean).some((f) => String(f).toLowerCase().includes(q)))
      .map((a) => ({
        kind: "accesorio", id: `a-${a.id}`, icon: Gem, tipoLabel: "Accesorio",
        imagenUrl: a.imagenUrl, eyebrow: a.categoria, title: a.nombre,
        description: a.descripcion, price: a.precio,
        stockState: stockStateOf(a.cantidadDisponible, a.cantidadMinima),
        whatsappMessage: `Hola, me interesa "${a.nombre}"`,
        onAdd: onAddToCart ? () => onAddToCart({ kind: "accesorio", id: a.id, tipo: "frasco", cantidad: 1, nombre: a.nombre, precioUnitario: a.precio, imagenUrl: a.imagenUrl }) : null,
        detalle: { icon: Gem, imagenUrl: a.imagenUrl, eyebrow: a.categoria, title: a.nombre, description: a.descripcion, price: a.precio, whatsappMessage: `Hola, me interesa "${a.nombre}"` },
      }));

    return [...dePerfumes, ...deAccesorios];
  }, [perfumes, accesorios, q]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-2">Resultados</p>
        <h1 className="jaco-serif text-4xl font-semibold text-ink">"{query}"</h1>
        <p className="text-sm text-neutral-500 mt-2">{resultados.length} resultado{resultados.length !== 1 ? "s" : ""} en perfumes y accesorios.</p>
      </div>

      {resultados.length === 0 ? (
        <EmptyState icon={SearchX} title="No encontramos nada con ese nombre" subtitle="Prueba con otra palabra, o revisa el catálogo completo desde el menú." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {resultados.map((r) => (
            <ProductPublicCard
              key={r.id}
              icon={r.icon}
              imagenUrl={r.imagenUrl}
              eyebrow={r.eyebrow}
              title={r.title}
              description={r.description}
              price={r.price}
              meta={r.meta || r.tipoLabel}
              calificacion={r.calificacion}
              stockState={r.stockState}
              whatsappMessage={r.whatsappMessage}
              onAdd={r.onAdd}
              onClick={() => setSeleccionado(r.detalle)}
            />
          ))}
        </div>
      )}

      <ProductDetailModal open={!!seleccionado} onClose={() => setSeleccionado(null)} product={seleccionado} />
    </div>
  );
}
