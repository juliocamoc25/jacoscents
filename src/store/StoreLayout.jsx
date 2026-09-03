import React, { useState } from "react";
import { Menu, X, Lock, Search, ShoppingBag, MessageCircle } from "lucide-react";
import { cx, whatsappLink } from "../utils";
import { WHATSAPP_NUMBER } from "../constants";

const NAV = [
  { id: "home", label: "Inicio" },
  { id: "perfumes", label: "Perfumes" },
  { id: "decants", label: "Decants" },
  { id: "accesorios", label: "Accesorios" },
  { id: "recomendador", label: "Para ti" },
];

export default function StoreLayout({ page, onNavigate, onRequestAdmin, onSearch, cartCount = 0, onOpenCart, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const submitSearch = () => {
    if (!query.trim()) return;
    onSearch(query.trim());
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-ink">
      <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-gold-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5 shrink-0">
            <span className="w-10 h-10 rounded-full bg-bone-50 flex items-center justify-center shrink-0 p-1.5 shadow-lux-sm">
              <img src="/img/logo-transparent.png" alt="JACO SCENTS" className="w-full h-full object-contain" />
            </span>
            <span className="flex flex-col items-start">
              <span className="jaco-display text-2xl font-bold tracking-[0.12em] text-white leading-none">JACO<span className="text-gold-400">SCENTS</span></span>
              <span className="text-[9px] text-neutral-400 tracking-[0.3em] uppercase mt-0.5">Perfumería &amp; Decants</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => onNavigate(n.id)}
                className={cx(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  page === n.id ? "bg-gold-400 text-ink" : "text-neutral-300 hover:text-white hover:bg-white/5"
                )}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setSearchOpen((v) => !v)} title="Buscar" aria-label="Buscar" className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/5">
              <Search size={18} />
            </button>
            <button onClick={onOpenCart} title="Mi pedido" aria-label="Mi pedido" className="relative p-2 rounded-full text-neutral-100 hover:text-white hover:bg-white/5">
              <ShoppingBag size={21} strokeWidth={2.1} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold-400 text-ink text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} className="md:hidden p-2 text-white">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-white/10 px-4 sm:px-6 py-3">
            <div className="max-w-7xl mx-auto relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                placeholder="Buscar perfumes, decants o accesorios..."
                className="w-full pl-9 pr-20 py-2.5 rounded-full bg-neutral-900 border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
              <button onClick={submitSearch} className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-gold-400 text-ink text-xs font-semibold hover:bg-gold-300">
                Buscar
              </button>
            </div>
          </div>
        )}

        {menuOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-2 flex flex-col">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => { onNavigate(n.id); setMenuOpen(false); }}
                className={cx("text-left px-2 py-2.5 text-sm font-medium rounded-lg", page === n.id ? "text-gold-400" : "text-neutral-300")}
              >
                {n.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="jaco-fade-in">{children}</main>

      <footer className="bg-ink text-neutral-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-full bg-bone-50 flex items-center justify-center shrink-0 p-1">
                <img src="/img/logo-transparent.png" alt="JACO SCENTS" className="w-full h-full object-contain" />
              </span>
              <span className="jaco-display text-xl font-bold text-white">JACO<span className="text-gold-400">SCENTS</span></span>
            </div>
            <p className="text-xs mt-2 leading-relaxed max-w-xs">Perfumes originales y decants seleccionados. Encuentra tu fragancia sin comprar el frasco completo.</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-widest mb-2">Explorar</p>
            <div className="flex flex-col gap-1.5 text-xs">
              {NAV.filter((n) => n.id !== "home").map((n) => (
                <button key={n.id} onClick={() => onNavigate(n.id)} className="text-left hover:text-gold-400 w-fit">{n.label}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-widest mb-2">Contacto</p>
              <p className="text-xs">Escríbenos por WhatsApp desde cualquier producto para cotizar o comprar.</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <p className="text-[11px] text-neutral-500">© {new Date().getFullYear()} JACO SCENTS</p>
          <button onClick={onRequestAdmin} className="flex items-center gap-1 text-[11px] text-neutral-600 hover:text-neutral-300">
            <Lock size={11} /> Acceso administrador
          </button>
        </div>
      </footer>

      <a
        href={whatsappLink(WHATSAPP_NUMBER, "Hola, tengo una pregunta sobre sus perfumes")}
        target="_blank"
        rel="noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lux hover:scale-105 transition-transform"
      >
        <MessageCircle size={26} fill="white" strokeWidth={0} />
      </a>
    </div>
  );
}
