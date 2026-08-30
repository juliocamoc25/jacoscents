import React, { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { cx } from "../../utils";
import { SectionCard } from "../UI";

// URL de tu backend/proxy que reenvía la petición a la API de Anthropic
// (necesario porque la API no puede llamarse directamente desde el navegador:
// requiere una API key secreta y no permite peticiones CORS desde el cliente).
// Configúrala en un archivo .env como: VITE_AI_PROXY_URL=http://localhost:8787/api/asistente
const AI_PROXY_URL = import.meta.env.VITE_AI_PROXY_URL;

export default function AsistenteTab({ perfumes, clientes, ventas }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sugerencias = [
    "¿Cuál fue mi perfume más vendido este mes?",
    "¿Cuánto dinero gané la semana pasada?",
    "¿Qué perfumes necesito volver a comprar?",
    "¿Qué clientes no han comprado en tres meses?",
    "¿Qué perfume tiene mayor margen?",
  ];

  const buildContext = () => {
    const now = new Date();
    const resumenPerfumes = perfumes.map((p) => ({
      nombre: p.nombre, marca: p.marca, stock: p.cantidadDisponible, minimo: p.cantidadMinima,
      precioVenta: p.precioVenta, costoPromedio: p.costoPromedio,
      margen: p.precioVenta ? Math.round(((p.precioVenta - (p.costoPromedio || p.precioCompra || 0)) / p.precioVenta) * 100) : null,
      decantMlDisponible: p.decant?.habilitado ? p.decant.mlDisponible : null,
    }));
    const resumenVentas = ventas.slice(0, 200).map((v) => ({
      fecha: v.fecha, total: v.total, ganancia: v.ganancia, clienteId: v.clienteId,
      items: v.items.map((i) => ({ nombre: i.nombrePerfume, tipo: i.tipo, cantidad: i.cantidad, subtotal: i.subtotal })),
    }));
    const resumenClientes = clientes.map((c) => {
      const compras = ventas.filter((v) => v.clienteId === c.id);
      const ultima = compras.length ? compras.reduce((a, b) => new Date(a.fecha) > new Date(b.fecha) ? a : b).fecha : null;
      return { nombre: c.nombre, ultimaCompra: ultima, totalCompras: compras.length };
    });
    return { fechaActual: now.toISOString(), perfumes: resumenPerfumes, ventas: resumenVentas, clientes: resumenClientes };
  };

  const enviar = async (pregunta) => {
    if (!pregunta.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: pregunta }]);
    setInput("");

    if (!AI_PROXY_URL) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "El asistente de IA todavía no está conectado. Este panel necesita un pequeño servidor (proxy) que reenvíe la pregunta a la API de Anthropic usando tu API key — no se puede llamar directamente desde el navegador. Revisa el README (sección 'Asistente IA') para configurarlo con la variable VITE_AI_PROXY_URL.",
      }]);
      return;
    }

    setLoading(true);
    try {
      const contexto = buildContext();
      const res = await fetch(AI_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, contexto }),
      });
      const data = await res.json();
      const texto = data.texto || data.respuesta || "No pude generar una respuesta con los datos disponibles.";
      setMessages((prev) => [...prev, { role: "assistant", content: texto }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Ocurrió un error al consultar al asistente. Intenta de nuevo en unos segundos." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <SectionCard title="Asistente IA de JACO SCENTS">
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <div>
              <p className="text-sm text-neutral-500 mb-3">Pregúntame sobre tus ventas, inventario o clientes.</p>
              <div className="flex flex-wrap gap-2">
                {sugerencias.map((s) => (
                  <button key={s} onClick={() => enviar(s)} className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-600 hover:border-black hover:text-black">{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cx("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap", m.role === "user" ? "bg-black text-white" : "bg-neutral-100 text-neutral-800")}>{m.content}</div>
            </div>
          ))}
          {loading && <div className="flex justify-start"><div className="bg-neutral-100 rounded-2xl px-4 py-2.5"><Loader2 size={15} className="animate-spin text-neutral-400" /></div></div>}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar(input)} placeholder="Escribe tu pregunta..." className="flex-1 px-3 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600" />
          <button onClick={() => enviar(input)} disabled={loading} aria-label="Enviar pregunta" className="px-4 py-2.5 rounded-lg bg-black text-white hover:bg-neutral-800 disabled:opacity-40"><Send size={16} /></button>
        </div>
      </SectionCard>
    </div>
  );
}
