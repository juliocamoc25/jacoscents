import React, { useMemo, useState } from "react";
import { Wand2, ArrowRight, RotateCcw } from "lucide-react";
import ProductPublicCard from "./ProductPublicCard";
import ProductDetailModal from "./ProductDetailModal";
import { EmptyState } from "../components/common";
import { GENEROS, TEMPORADAS, TIPOS } from "../constants";
import { stockStateOf } from "../utils";
import { Package } from "lucide-react";

// Agrupamos TIPOS reales en 3 niveles de intensidad que un cliente sí entiende
// sin saber de perfumería (nadie pregunta "¿quieres un Extrait?").
const INTENSIDAD = {
  ligero: ["EDT", "Cologne"],
  equilibrado: ["EDP"],
  intenso: ["Parfum", "Extrait", "Elixir"],
};

const PASOS = [
  {
    key: "genero",
    pregunta: "¿Para quién es?",
    opciones: [
      { value: "Masculino", label: "Para él" },
      { value: "Femenino", label: "Para ella" },
      { value: "Unisex", label: "Unisex" },
    ],
  },
  {
    key: "temporada",
    pregunta: "¿Para qué momento lo quieres?",
    opciones: TEMPORADAS.map((t) => ({ value: t, label: t })),
  },
  {
    key: "intensidad",
    pregunta: "¿Qué tan intenso te gusta?",
    opciones: [
      { value: "ligero", label: "Ligero, para el día a día" },
      { value: "equilibrado", label: "Equilibrado" },
      { value: "intenso", label: "Intenso, que se note" },
    ],
  },
];

export default function RecomendadorView({ perfumes, onNavigate }) {
  const [step, setStep] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [seleccionado, setSeleccionado] = useState(null);

  const responder = (key, value) => {
    setRespuestas((prev) => ({ ...prev, [key]: value }));
    setStep((s) => s + 1);
  };

  const reiniciar = () => { setRespuestas({}); setStep(0); };

  const resultados = useMemo(() => {
    if (step < PASOS.length) return [];
    const tiposOk = respuestas.intensidad ? INTENSIDAD[respuestas.intensidad] : null;
    const activos = perfumes.filter((p) => p.activo !== false);
    const puntuado = activos.map((p) => {
      let score = 0;
      if (respuestas.genero && (p.genero === respuestas.genero || p.genero === "Unisex")) score += 2;
      if (respuestas.temporada && (p.temporada === respuestas.temporada || p.temporada === "Todo el año")) score += 2;
      if (tiposOk && tiposOk.includes(p.tipo)) score += 1;
      if (p.destacado) score += 1;
      if (p.calificacion) score += p.calificacion / 5;
      return { p, score };
    });
    return puntuado
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.p);
  }, [perfumes, respuestas, step]);

  const pasoActual = PASOS[step];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-2 flex items-center justify-center gap-1.5">
          <Wand2 size={13} /> Recomendador
        </p>
        <h1 className="jaco-serif text-4xl font-semibold text-ink">Encuentra tu fragancia</h1>
        <p className="text-sm text-neutral-500 mt-2">Responde 3 preguntas rápidas y te mostramos las mejores opciones de nuestro catálogo.</p>
      </div>

      {pasoActual ? (
        <div className="max-w-lg mx-auto">
          <div className="flex justify-center gap-1.5 mb-6">
            {PASOS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? "w-8 bg-gold-500" : "w-4 bg-bone-300"}`} />
            ))}
          </div>
          <h2 className="jaco-serif text-2xl font-semibold text-ink text-center mb-6">{pasoActual.pregunta}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pasoActual.opciones.map((op) => (
              <button
                key={op.value}
                onClick={() => responder(pasoActual.key, op.value)}
                className="group px-4 py-5 rounded-2xl border border-bone-300 bg-white hover:border-ink hover:bg-ink hover:text-white transition-colors text-center"
              >
                <span className="text-sm font-semibold flex items-center justify-center gap-1.5">
                  {op.label} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </button>
            ))}
          </div>
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="block mx-auto mt-6 text-xs text-neutral-400 hover:text-neutral-600">← Regresar</button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-neutral-500">{resultados.length} recomendacion{resultados.length !== 1 ? "es" : ""} para ti</p>
            <button onClick={reiniciar} className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-ink">
              <RotateCcw size={13} /> Volver a empezar
            </button>
          </div>
          {resultados.length === 0 ? (
            <EmptyState icon={Wand2} title="No encontramos una combinación exacta" subtitle="Prueba con otras respuestas, o explora el catálogo completo." actionLabel="Ver catálogo completo" onAction={() => onNavigate("perfumes")} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {resultados.map((p) => (
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
                  stockState={stockStateOf(p.cantidadDisponible, p.cantidadMinima)}
                  whatsappMessage={`Hola, me interesa el perfume "${p.nombre}"`}
                  onClick={() => setSeleccionado(p)}
                />
              ))}
            </div>
          )}
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
          price: seleccionado.precioVenta,
          calificacion: seleccionado.calificacion,
          meta: [seleccionado.tipo, seleccionado.concentracion, seleccionado.presentacionMl ? `${seleccionado.presentacionMl} ml` : null].filter(Boolean).join(" · "),
          whatsappMessage: `Hola, me interesa el perfume "${seleccionado.nombre}"`,
        } : null}
      />
    </div>
  );
}
