import React, { useState, useMemo } from "react";
import { Droplet, Package, Gem, ArrowRight, Sparkles, ShieldCheck, Truck, MessageCircle, ChevronDown, Lightbulb } from "lucide-react";
import { money } from "../utils";
import { tips } from "../data/tips";

// Fotos de marca para el carrusel del hero. Viven en /public/img/hero así
// que basta con reemplazar esos 3 archivos (mismos nombres) para actualizar
// las fotos sin tocar código.
const HERO_SLIDES = [
  { src: "/img/hero/hero-1.jpeg", alt: "Decants JACO SCENTS junto a frascos originales" },
  { src: "/img/hero/hero-2.jpg", alt: "Selección de perfumes originales JACO SCENTS" },
  { src: "/img/hero/hero-3.jpg", alt: "Decants de diseñador y nicho JACO SCENTS" },
];

function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const pausedRef = React.useRef(false);

  React.useEffect(() => {
    if (HERO_SLIDES.length < 2) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {HERO_SLIDES.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {/* Oscurece la foto para que el texto blanco del hero siga siendo legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40" />
      {HERO_SLIDES.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-gold-400" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryCard({ icon: Icon, title, subtitle, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className="group relative text-left bg-ink rounded-2xl p-6 overflow-hidden border border-white/5 hover:border-gold-400/40 transition-colors shadow-lux"
    >
      <div className="absolute inset-0 jaco-hero-noise opacity-70 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center mb-5">
          <Icon size={20} className="text-gold-400" strokeWidth={1.4} />
        </div>
        <h3 className="jaco-serif text-2xl font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-neutral-400 mb-5 max-w-[26ch]">{subtitle}</p>
        <div className="flex items-center justify-between">
          {typeof count === "number" && <span className="text-[11px] text-neutral-500 uppercase tracking-widest">{count} disponibles</span>}
          <span className="flex items-center gap-1 text-xs font-semibold text-gold-400 group-hover:gap-2 transition-all">
            Ver todo <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </button>
  );
}

// Paleta de acentos que rota por producto (por índice) para que las tarjetas
// sin foto real no se vean todas idénticas — sigue sin ser una foto, pero
// deja de sentirse repetitivo.
const ACCENTS = [
  "from-wine-700 via-ink to-ink",
  "from-[#2a1c14] via-ink to-wine-700",
  "from-gold-700 via-ink to-ink",
  "from-[#1c1512] via-wine-700 to-ink",
];

function ShowcaseCarousel({ items, curated, onOpen }) {
  const trackRef = React.useRef(null);
  const pausedRef = React.useRef(false);

  React.useEffect(() => {
    if (items.length < 3) return;
    const el = trackRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (pausedRef.current || !el) return;
      const cardWidth = el.firstChild ? el.firstChild.offsetWidth + 16 : 200;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + cardWidth, behavior: "smooth" });
    }, 3200);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-24 relative z-10">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gold-400">
          <Sparkles size={13} /> {curated ? "Destacados" : "Recién llegados"}
        </span>
        <span className="text-[11px] text-neutral-500 hidden sm:block">Desliza para ver más →</span>
      </div>
      <div
        ref={trackRef}
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
        onTouchStart={() => (pausedRef.current = true)}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory jaco-scrollbar-hide"
      >
        {items.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onOpen(p)}
            className="group snap-start shrink-0 w-40 sm:w-52 text-left"
          >
            <div className={`aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br ${ACCENTS[i % ACCENTS.length]} shadow-lux relative`}>
              <span className="absolute inset-0 flex items-center justify-center jaco-serif text-8xl font-bold text-white/[0.08] select-none">
                {(p.nombre || "?").charAt(0).toUpperCase()}
              </span>
              {p.imagenUrl && (
                <img
                  src={p.imagenUrl}
                  alt={p.nombre}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3.5">
                <p className="text-white text-sm font-semibold leading-tight truncate">{p.nombre}</p>
                <p className="text-gold-300 text-xs font-medium mt-0.5">{money(p.precioVenta)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: ShieldCheck, title: "100% originales", subtitle: "Garantizamos la autenticidad de cada frasco y decant." },
    { icon: Truck, title: "Envío a todo México", subtitle: "Empacado seguro para que llegue en perfecto estado." },
    { icon: MessageCircle, title: "Atención directa", subtitle: "Resolvemos tus dudas por WhatsApp antes de comprar." },
  ];
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {items.map((it) => (
          <div key={it.title} className="flex items-start gap-3 bg-white border border-bone-300 rounded-xl p-4">
            <div className="w-9 h-9 rounded-full bg-gold-400/15 border border-gold-400/30 flex items-center justify-center shrink-0">
              <it.icon size={16} className="text-gold-700" strokeWidth={1.6} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{it.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{it.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-bone-300 py-4">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left gap-4">
        <span className="text-sm font-semibold text-ink">{question}</span>
        <ChevronDown size={16} className={`text-neutral-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{answer}</p>}
    </div>
  );
}

function Faq() {
  const preguntas = [
    { q: "¿Los perfumes son originales?", a: "Sí, 100% originales y sellados. No vendemos réplicas ni clones." },
    { q: "¿Cómo funcionan los decants?", a: "Tomamos una fracción del frasco original y la envasamos en un atomizador, así puedes probar una fragancia sin comprar el frasco completo." },
    { q: "¿Cómo compro?", a: "Escríbenos por WhatsApp desde el botón \"Consultar\" en cualquier producto — ahí coordinamos pago y envío." },
    { q: "¿Hacen envíos?", a: "Sí, a todo México. Pregunta por tiempos y costos según tu ciudad al escribirnos." },
  ];
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-2">Preguntas frecuentes</p>
        <h2 className="jaco-serif text-3xl font-semibold text-ink">¿Tienes dudas?</h2>
      </div>
      <div>
        {preguntas.map((p) => <FaqItem key={p.q} question={p.q} answer={p.a} />)}
      </div>
    </section>
  );
}

function SobreNosotros({ onNavigate }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-2">Sobre nosotros</p>
          <h2 className="jaco-serif text-3xl sm:text-4xl font-semibold text-ink mb-4">Perfumería para quienes aman probar antes de comprometerse</h2>
          <p className="text-sm text-neutral-600 leading-relaxed mb-3">
            En JACO SCENTS creemos que encontrar tu fragancia ideal no debería significar arriesgar tu dinero en un frasco completo
            que quizá no te termine de convencer. Por eso trabajamos con decants exactos al mililitro junto a nuestro catálogo de
            frascos 100% originales — para que puedas explorar, comparar y decidir con calma.
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Cada pedido lo atendemos directamente por WhatsApp, de persona a persona, para resolver tus dudas antes de que compres
            y acompañarte durante el envío.
          </p>
          <button onClick={() => onNavigate("decants")} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-wine-700">
            Explorar el catálogo <ArrowRight size={14} />
          </button>
        </div>
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-ink via-neutral-900 to-wine-700 jaco-hero-noise">
          <img
            src="/img/img_inicio.png"
            alt="JACO SCENTS — perfumería y decants"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function MarcasStrip({ perfumes }) {
  const marcas = useMemo(() => {
    const set = new Set(perfumes.filter((p) => p.activo !== false).map((p) => p.marca).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [perfumes]);

  if (marcas.length === 0) return null;

  return (
    <section className="border-y border-bone-300 bg-bone-100/60 py-6 overflow-hidden">
      <p className="text-center text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-4">Marcas que manejamos</p>
      <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {marcas.map((m) => (
          <span key={m} className="text-sm text-neutral-500 font-medium whitespace-nowrap">{m}</span>
        ))}
      </div>
    </section>
  );
}

function Tips() {
  if (!tips || tips.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="mb-10 text-center max-w-xl mx-auto">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-2">Guía rápida</p>
        <h2 className="jaco-serif text-3xl sm:text-4xl font-semibold text-ink">Consejos sobre perfumes y decants</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {tips.map((t, i) => (
          <div key={i} className="bg-white border border-bone-300 rounded-2xl p-5">
            <Lightbulb size={18} className="text-gold-400 mb-3" />
            <p className="text-sm font-semibold text-ink mb-2">{t.titulo}</p>
            <p className="text-sm text-neutral-600 leading-relaxed">{t.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TiendaHome({ perfumes, accesorios, onNavigate }) {
  const decantsCount = perfumes.filter((p) => p.decant?.habilitado && p.activo !== false).length;
  const perfumesCount = perfumes.filter((p) => p.activo !== false && p.tieneFrascoCompleto).length;
  const accesoriosCount = accesorios.filter((a) => a.activo !== false).length;
  const activos = perfumes.filter((p) => p.activo !== false && p.tieneFrascoCompleto);
  const marcados = activos.filter((p) => p.destacado);
  const destacados = (marcados.length ? marcados : activos).slice(0, 8);

  return (
    <div>
      <section className="relative overflow-hidden min-h-[560px] sm:min-h-[720px]">
        <HeroCarousel />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-28 sm:pt-28 sm:pb-36 text-center relative z-[1]">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-400 mb-5">
            <span className="w-6 h-px bg-gold-400" /> Perfumería &amp; Decants <span className="w-6 h-px bg-gold-400" />
          </span>
          <h1 className="jaco-display text-5xl sm:text-7xl font-bold text-white leading-[1.05] mb-6">
            
          </h1>
          <p className="text-neutral-300 max-w-xl mx-auto text-sm sm:text-base mb-9">
            
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => onNavigate("decants")} className="px-6 py-3 rounded-full bg-gold-400 text-ink text-sm font-semibold hover:bg-gold-300 transition-colors">
              Explorar decants
            </button>
            <button onClick={() => onNavigate("perfumes")} className="px-6 py-3 rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
              Ver catálogo completo
            </button>
          </div>
        </div>
      </section>

      <ShowcaseCarousel items={destacados} curated={marcados.length > 0} onOpen={() => onNavigate("perfumes")} />

      <TrustBar />

      <MarcasStrip perfumes={perfumes} />

      <SobreNosotros onNavigate={onNavigate} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <button onClick={() => onNavigate("recomendador")} className="group w-full flex flex-col sm:flex-row items-center justify-between gap-4 jaco-hero-noise rounded-2xl p-6 sm:p-8 text-left shadow-lux overflow-hidden" style={{ background: "linear-gradient(160deg, #0b0908 0%, #1c1512 55%, #2a1c14 100%)" }}>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-400 mb-2">Recomendador</p>
            <h3 className="jaco-serif text-2xl sm:text-3xl font-semibold text-white">¿No sabes cuál elegir? Te ayudamos en 3 preguntas.</h3>
          </div>
          <span className="flex items-center gap-2 px-6 py-3 rounded-full bg-gold-400 text-ink text-sm font-semibold group-hover:bg-gold-300 transition-colors whitespace-nowrap shrink-0">
            Empezar <ArrowRight size={15} />
          </span>
        </button>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="mb-10 text-center max-w-xl mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-2">Explora</p>
          <h2 className="jaco-serif text-3xl sm:text-4xl font-semibold text-ink">Encuentra lo que buscas</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <CategoryCard icon={Droplet} title="Decants" subtitle="Prueba antes de comprar el frasco completo, por mililitro." count={decantsCount} onClick={() => onNavigate("decants")} />
          <CategoryCard icon={Package} title="Perfumes" subtitle="Catálogo completo de frascos originales, todas las casas." count={perfumesCount} onClick={() => onNavigate("perfumes")} />
          <CategoryCard icon={Gem} title="Accesorios" subtitle="Decants de bolsillo, atomizadores y sets de viaje." count={accesoriosCount} onClick={() => onNavigate("accesorios")} />
        </div>
      </section>

      <Tips />

      <Faq />
    </div>
  );
}
