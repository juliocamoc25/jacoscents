import React, { useMemo, useState } from "react";
import { Droplet, Plus } from "lucide-react";
import { money, whatsappLink, precioDecant } from "../utils";
import { WHATSAPP_NUMBER, TAMANOS_DECANT, GENEROS } from "../constants";
import { EmptyState } from "../components/common";
import { ProductFilters, useProductFilters } from "./ProductFilters";
import RatingStars from "../components/RatingStars";

const SUBTABS = [
  { id: "Masculino", label: "Hombre" },
  { id: "Femenino", label: "Mujer" },
  { id: "Unisex", label: "Unisex" },
];

function DecantPublicCard({ perfume, onAddToCart }) {
  const tamanos = perfume.decant.tamanos?.length ? perfume.decant.tamanos : TAMANOS_DECANT;
  const precioMin = tamanos.length ? precioDecant(perfume.decant, Math.min(...tamanos)) : null;
  const mlDisponible = perfume.decant.mlDisponible || 0;
  const agotado = mlDisponible <= 0;

  return (
    <div className="bg-white border border-bone-300 rounded-2xl overflow-hidden shadow-lux-sm hover:shadow-lux hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-ink via-neutral-900 to-wine-700 flex items-center justify-center jaco-hero-noise">
        {perfume.imagenUrl ? (
          <img src={perfume.imagenUrl} alt={perfume.nombre} className={`w-full h-full object-cover absolute inset-0 ${agotado ? "opacity-40 grayscale" : ""}`} onError={(e) => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <Droplet size={36} className="text-gold-400/70" strokeWidth={1.2} />
        )}
        {!agotado && precioMin != null && (
          <span className="absolute top-3 left-3 bg-ink/80 backdrop-blur text-gold-300 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border border-gold-400/30">
            Desde {money(precioMin)}
          </span>
        )}
        {agotado && (
          <span className="absolute top-3 right-3 bg-wine-600 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
            Agotado
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] text-gold-700 uppercase tracking-widest font-semibold truncate">{perfume.marca || perfume.casaPerfumera}</p>
        <h3 className="jaco-serif text-xl font-semibold text-ink truncate mt-0.5">{perfume.nombre}</h3>
        {perfume.calificacion > 0 && <div className="mt-1"><RatingStars value={perfume.calificacion} /></div>}
        {agotado ? (
          <p className="text-xs text-neutral-500 mt-3">Sin mililitros disponibles por ahora.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tamanos.map((t) => {
                const disponible = t <= mlDisponible;
                return disponible ? (
                  <span key={t} className="flex items-center gap-1 rounded-lg border border-bone-300 pl-2.5 pr-1 py-1 hover:border-ink transition-colors">
                    <a
                      href={whatsappLink(WHATSAPP_NUMBER, `Hola, quiero un decant de ${t}ml de "${perfume.nombre}"`)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-medium text-neutral-600 hover:text-ink"
                    >
                      {t}ml · {money(precioDecant(perfume.decant, t))}
                    </a>
                    {onAddToCart && (
                      <button
                        onClick={() => onAddToCart({ kind: "perfume", id: perfume.id, tipo: "decant", ml: t, cantidad: 1, nombre: `${perfume.nombre} (decant ${t}ml)`, precioUnitario: precioDecant(perfume.decant, t), imagenUrl: perfume.imagenUrl })}
                        title="Agregar al pedido"
                        aria-label="Agregar al pedido"
                        className="w-5 h-5 flex items-center justify-center rounded-full text-neutral-400 hover:bg-ink hover:text-white transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    )}
                  </span>
                ) : (
                  <span key={t} className="px-2.5 py-1.5 rounded-lg border border-bone-200 text-[11px] font-medium text-neutral-400 line-through cursor-not-allowed">
                    {t}ml
                  </span>
                );
              })}
            </div>
            {mlDisponible <= Math.min(...tamanos) * 1.5 && (
              <p className="text-[11px] text-amber-600 font-medium mt-2">Quedan {Math.round(mlDisponible)} ml — últimas piezas.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function DecantsPublicView({ perfumes, onAddToCart }) {
  const [tab, setTab] = useState("Masculino");
  const filters = useProductFilters(perfumes);

  const habilitados = useMemo(
    () => perfumes.filter((p) => p.decant?.habilitado && p.activo !== false),
    [perfumes]
  );
  // Si un perfume no tiene género válido asignado, lo mostramos en Unisex en
  // vez de que desaparezca silenciosamente del catálogo.
  const visibles = habilitados.filter((p) =>
    (tab === "Unisex" ? p.genero === "Unisex" || !GENEROS.includes(p.genero) : p.genero === tab) && filters.apply(p)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-2">Por mililitro</p>
        <h1 className="jaco-serif text-4xl font-semibold text-ink">Decants</h1>
        <p className="text-sm text-neutral-500 mt-2">Prueba una fragancia antes de comprar el frasco completo.</p>
      </div>

      <div className="flex justify-center gap-2 mb-9">
        {SUBTABS.map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${tab === s.id ? "bg-ink text-white border-ink" : "border-bone-300 text-neutral-500 hover:border-ink"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <ProductFilters {...filters} />
      </div>

      {visibles.length === 0 ? (
        <EmptyState icon={Droplet} title="Aún no hay decants en esta categoría" subtitle="Vuelve pronto, estamos actualizando el catálogo constantemente." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibles.map((p) => <DecantPublicCard key={p.id} perfume={p} onAddToCart={onAddToCart} />)}
        </div>
      )}
    </div>
  );
}
