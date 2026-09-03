import React from "react";
import { MessageCircle, Droplet } from "lucide-react";
import { money, whatsappLink } from "../utils";
import { WHATSAPP_NUMBER } from "../constants";
import { Modal } from "../components/UI";
import RatingStars from "../components/RatingStars";

function tagsFrom(text) {
  return String(text || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function NotaGrupo({ label, value }) {
  const tags = tagsFrom(value);
  if (!tags.length) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {tags.map((t) => (
          <span key={t} className="text-[11px] bg-bone-100 text-neutral-700 px-2 py-0.5 rounded-full border border-bone-200">{t}</span>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailModal({ open, onClose, product }) {
  if (!product) return null;
  const { imagenUrl, eyebrow, title, description, price, meta, notas, notasSalida, notasCorazon, notasFondo, whatsappMessage, icon: Icon = Droplet, calificacion } = product;
  const tienePiramide = tagsFrom(notasSalida).length || tagsFrom(notasCorazon).length || tagsFrom(notasFondo).length;

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-ink via-neutral-900 to-wine-700 flex items-center justify-center jaco-hero-noise">
          {imagenUrl ? (
            <img src={imagenUrl} alt={title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <Icon size={48} className="text-gold-400/70" strokeWidth={1.1} />
          )}
        </div>
        <div className="flex flex-col">
          {eyebrow && <p className="text-[11px] text-gold-700 uppercase tracking-widest font-semibold">{eyebrow}</p>}
          <h3 className="jaco-serif text-2xl font-semibold text-ink mt-0.5">{title}</h3>
          {calificacion > 0 && <div className="mt-1"><RatingStars value={calificacion} size="text-sm" /></div>}
          {meta && <p className="text-xs text-neutral-500 mt-1">{meta}</p>}
          {description && <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{description}</p>}

          {tienePiramide ? (
            <div className="mt-4 space-y-2.5">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">Pirámide olfativa</p>
              <NotaGrupo label="Salida" value={notasSalida} />
              <NotaGrupo label="Corazón" value={notasCorazon} />
              <NotaGrupo label="Fondo" value={notasFondo} />
            </div>
          ) : notas ? (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-1">Notas</p>
              <p className="text-sm text-neutral-600">{notas}</p>
            </div>
          ) : null}

          <div className="mt-auto pt-5">
            <p className="jaco-display text-2xl font-bold text-ink mb-3">{money(price)}</p>
            <a
              href={whatsappLink(WHATSAPP_NUMBER, whatsappMessage || `Hola, me interesa "${title}"`)}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-ink text-white text-sm font-semibold hover:bg-wine-600 transition-colors"
            >
              <MessageCircle size={15} /> Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
