import React from "react";
import { money, precioDecant } from "../utils";
import { BottleGauge } from "./UI";
import { TAMANOS_DECANT } from "../constants";

export default function DecantCard({ perfume, onAbrir, onVender }) {
  const pct = perfume.decant.mlTotalAbierto > 0 ? (perfume.decant.mlDisponible / perfume.decant.mlTotalAbierto) * 100 : 0;
  const tamanos = perfume.decant.tamanos && perfume.decant.tamanos.length ? perfume.decant.tamanos : TAMANOS_DECANT;
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex gap-4">
      <BottleGauge pct={pct} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-neutral-400 uppercase tracking-wide truncate">{perfume.marca}</p>
        <h4 className="text-sm font-semibold text-neutral-900 truncate">{perfume.nombre}</h4>
        <p className="text-xs text-neutral-500 my-2">{Math.round(perfume.decant.mlDisponible)} ml disponibles de {perfume.decant.mlTotalAbierto} ml</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tamanos.map((t) => (
            <button
              key={t}
              onClick={() => onVender(perfume, t)}
              disabled={perfume.decant.mlDisponible < t}
              className="px-2 py-1 rounded-lg border border-neutral-200 text-[11px] font-medium hover:border-black disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t}ml · {money(precioDecant(perfume.decant, t))}
            </button>
          ))}
        </div>
        <button onClick={() => onAbrir(perfume)} className="text-[11px] text-neutral-500 hover:text-black underline underline-offset-2">+ Abrir nuevo frasco</button>
      </div>
    </div>
  );
}
