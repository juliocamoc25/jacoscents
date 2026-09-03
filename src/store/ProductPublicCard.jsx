import React from "react";
import { Droplet, MessageCircle, Plus } from "lucide-react";
import { money, whatsappLink } from "../utils";
import { WHATSAPP_NUMBER } from "../constants";
import RatingStars from "../components/RatingStars";

// Tarjeta de producto para la tienda pública: solo lectura + CTA de contacto
// por WhatsApp (no hay carrito/checkout en la vista de cliente).
export default function ProductPublicCard({ imagenUrl, eyebrow, title, description, price, meta, stockState, whatsappMessage, icon: Icon = Droplet, onClick, calificacion, onAdd }) {
  const clickable = typeof onClick === "function";
  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cx2(
        "group relative bg-white border border-bone-300 rounded-2xl overflow-hidden shadow-lux-sm hover:shadow-lux hover:-translate-y-1 transition-all duration-300",
        clickable && "cursor-pointer"
      )}
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-ink via-neutral-900 to-wine-700">
        {imagenUrl ? (
          <img src={imagenUrl} alt={title} className={cx2("w-full h-full object-cover", stockState === "agotado" && "opacity-40 grayscale")} onError={(e) => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center jaco-hero-noise">
            <Icon size={40} className="text-gold-400/70" strokeWidth={1.2} />
          </div>
        )}
        {meta && (
          <span className="absolute top-3 left-3 bg-ink/80 backdrop-blur text-gold-300 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border border-gold-400/30">
            {meta}
          </span>
        )}
        {stockState === "agotado" && (
          <span className="absolute top-3 right-3 bg-wine-600 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
            Agotado
          </span>
        )}
        {stockState === "bajo" && (
          <span className="absolute top-3 right-3 bg-amber-500 text-ink text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
            Últimas piezas
          </span>
        )}
      </div>
      <div className="p-4">
        {eyebrow && <p className="text-[11px] text-gold-700 uppercase tracking-widest font-semibold truncate">{eyebrow}</p>}
        <h3 className="jaco-serif text-xl font-semibold text-ink truncate mt-0.5">{title}</h3>
        {calificacion > 0 && <div className="mt-1"><RatingStars value={calificacion} /></div>}
        {description && <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{description}</p>}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-bone-200">
          <span className="jaco-display text-lg font-bold text-ink">{money(price)}</span>
          {stockState === "agotado" ? (
            <span className="text-xs font-semibold text-neutral-500 px-3 py-2">No disponible</span>
          ) : (
            <div className="flex items-center gap-1.5">
              {onAdd && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAdd(); }}
                  title="Agregar al pedido"
                  aria-label="Agregar al pedido"
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-bone-300 text-neutral-600 hover:border-ink hover:text-ink transition-colors"
                >
                  <Plus size={14} />
                </button>
              )}
              <a
                href={whatsappLink(WHATSAPP_NUMBER, whatsappMessage || `Hola, me interesa "${title}"`)}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Consultar por WhatsApp"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-ink hover:bg-wine-600 w-8 h-8 sm:w-auto sm:px-3 sm:py-2 rounded-full transition-colors shrink-0"
              >
                <MessageCircle size={13} className="shrink-0" /> <span className="hidden sm:inline">Consultar</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cx2(...a) { return a.filter(Boolean).join(" "); }
