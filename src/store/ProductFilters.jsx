import React, { useMemo, useState } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { TIPOS, TEMPORADAS } from "../constants";

// Barra de filtros para el catálogo público de perfumes/decants.
// Deriva la lista de marcas de los datos reales (no hay un catálogo fijo de marcas),
// y usa Tipo/Temporada como aproximación de "ocasión de uso" ya que ese dato
// todavía no existe en el modelo — si se agrega más adelante, este componente
// puede sumar un chip más sin tocar el resto.
export function useProductFilters(perfumes) {
  const [busqueda, setBusqueda] = useState("");
  const [marca, setMarca] = useState("");
  const [tipo, setTipo] = useState("");
  const [temporada, setTemporada] = useState("");

  const marcas = useMemo(() => {
    const set = new Set(perfumes.map((p) => p.marca || p.casaPerfumera).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [perfumes]);

  const activeCount = [marca, tipo, temporada].filter(Boolean).length;

  const clear = () => { setMarca(""); setTipo(""); setTemporada(""); };

  const apply = (p) => {
    const q = busqueda.trim().toLowerCase();
    const camposBusqueda = [p.nombre, p.marca || p.casaPerfumera, p.notas, p.notasSalida, p.notasCorazon, p.notasFondo];
    const coincideBusqueda = !q || camposBusqueda.filter(Boolean).some((f) => String(f).toLowerCase().includes(q));
    return (
      coincideBusqueda &&
      (!marca || (p.marca || p.casaPerfumera) === marca) &&
      (!tipo || p.tipo === tipo) &&
      (!temporada || p.temporada === temporada)
    );
  };

  return { busqueda, setBusqueda, marca, setMarca, tipo, setTipo, temporada, setTemporada, marcas, activeCount, clear, apply };
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
        active ? "bg-ink text-white border-ink" : "border-bone-300 text-neutral-500 hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function ProductFilters(f) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={f.busqueda}
            onChange={(e) => f.setBusqueda(e.target.value)}
            placeholder="Busca por nombre o marca"
            className="w-full pl-9 pr-8 py-2 rounded-full border border-bone-300 text-sm text-neutral-700 focus:outline-none focus:border-ink transition-colors"
          />
          {f.busqueda && (
            <button
              onClick={() => f.setBusqueda("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-ink"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors shrink-0 ${
            f.activeCount ? "bg-ink text-white border-ink" : "border-bone-300 text-neutral-600 hover:border-ink"
          }`}
        >
          <SlidersHorizontal size={13} /> Filtros{f.activeCount ? ` (${f.activeCount})` : ""}
        </button>
      </div>

      {open && (
        <div className="mt-3 bg-white border border-bone-300 rounded-2xl p-4 space-y-4">
          {f.marcas.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Marca</p>
              <div className="flex flex-wrap gap-2">
                <Chip active={!f.marca} onClick={() => f.setMarca("")}>Todas</Chip>
                {f.marcas.map((m) => (
                  <Chip key={m} active={f.marca === m} onClick={() => f.setMarca(f.marca === m ? "" : m)}>{m}</Chip>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Tipo</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={!f.tipo} onClick={() => f.setTipo("")}>Todos</Chip>
              {TIPOS.map((t) => (
                <Chip key={t} active={f.tipo === t} onClick={() => f.setTipo(f.tipo === t ? "" : t)}>{t}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Ocasión / temporada</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={!f.temporada} onClick={() => f.setTemporada("")}>Todas</Chip>
              {TEMPORADAS.map((t) => (
                <Chip key={t} active={f.temporada === t} onClick={() => f.setTemporada(f.temporada === t ? "" : t)}>{t}</Chip>
              ))}
            </div>
          </div>
          {f.activeCount > 0 && (
            <button onClick={f.clear} className="flex items-center gap-1 text-xs font-semibold text-wine-600 hover:text-wine-500">
              <X size={13} /> Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
