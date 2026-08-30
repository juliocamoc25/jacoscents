import React, { useState, useEffect } from "react";
import { Search, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { money, fmtDate } from "../utils";
import { TIPOS, GENEROS, TEMPORADAS, TAMANOS_DECANT, ACCESORIO_CATEGORIAS } from "../constants";
import { defaultPerfumeForm, defaultClienteForm, defaultAccesorioForm } from "../data/defaults";
import { Field, TextInput, NumberInput, SelectInput, TextArea, FormSection, Modal, Badge, inputClass } from "./UI";
import { sanitizeText, sanitizeUrl, clampNumber } from "../security";
import ImageField from "./ImageField";

// URL de tu backend/proxy que busca datos de un perfume en internet y regresa
// JSON. Ver README, sección "Buscador de perfumes". Igual que el asistente,
// no se puede llamar a la API de Anthropic directo desde el navegador.
const PERFUME_LOOKUP_URL = import.meta.env.VITE_AI_PERFUME_LOOKUP_URL;

function PerfumeLookup({ onFound }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [msg, setMsg] = useState("");

  const buscar = async () => {
    if (!query.trim()) return;
    if (!PERFUME_LOOKUP_URL) {
      setStatus("error");
      setMsg("El buscador todavía no está conectado a un backend. Revisa el README (sección 'Buscador de perfumes') para configurar VITE_AI_PERFUME_LOOKUP_URL.");
      return;
    }
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch(PERFUME_LOOKUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: query }),
      });
      const data = await res.json();
      if (!data || data.encontrado === false) {
        setStatus("error");
        setMsg("No se encontró información confiable para ese perfume. Puedes llenar los campos a mano.");
        return;
      }
      onFound(data);
      setStatus("done");
      setMsg(`Datos de "${data.nombre || query}" cargados. Revisa y ajusta lo que haga falta.`);
    } catch (e) {
      setStatus("error");
      setMsg("Ocurrió un error al buscar. Intenta de nuevo o llena los campos a mano.");
    }
  };

  return (
    <div className="rounded-xl border border-gold-400/40 bg-gradient-to-br from-ink to-neutral-900 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={15} className="text-gold-400" />
        <p className="text-xs font-semibold text-gold-400 uppercase tracking-widest">Autocompletar con IA</p>
      </div>
      <p className="text-xs text-neutral-400 mb-3">Escribe el nombre del perfume (y marca si la sabes) — buscamos en internet y llenamos el formulario por ti. El precio de compra y venta los defines tú.</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Ej. Bleu de Chanel EDP"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>
        <button onClick={buscar} disabled={status === "loading"} className="px-4 py-2.5 rounded-lg bg-gold-400 text-ink text-sm font-semibold hover:bg-gold-500 disabled:opacity-50 flex items-center gap-1.5 shrink-0">
          {status === "loading" ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Buscar
        </button>
      </div>
      {msg && (
        <p className={cx2("text-xs mt-2 flex items-center gap-1.5", status === "error" ? "text-red-400" : "text-emerald-400")}>
          {status === "done" && <CheckCircle2 size={13} />}
          {msg}
        </p>
      )}
    </div>
  );
}

function cx2(...a) { return a.filter(Boolean).join(" "); }

export function PerfumeFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || defaultPerfumeForm());
  useEffect(() => { setForm(initial || defaultPerfumeForm()); }, [initial, open]);

  const set = (field) => (e) => {
    const val = e && e.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const applyLookup = (data) => {
    setForm((prev) => ({
      ...prev,
      nombre: data.nombre || prev.nombre,
      casaPerfumera: data.casaPerfumera || prev.casaPerfumera,
      marca: data.marca || data.casaPerfumera || prev.marca,
      genero: GENEROS.includes(data.genero) ? data.genero : prev.genero,
      tipo: TIPOS.includes(data.tipo) ? data.tipo : prev.tipo,
      concentracion: data.concentracion || prev.concentracion,
      presentacionMl: data.presentacionMl || prev.presentacionMl,
      notas: data.notas || prev.notas,
      descripcion: data.descripcion || prev.descripcion,
      inspiracion: data.inspiracion || prev.inspiracion,
      temporada: TEMPORADAS.includes(data.temporada) ? data.temporada : prev.temporada,
      imagenUrl: data.imagenUrl || prev.imagenUrl,
      // precioCompra y precioVenta NUNCA se tocan: los define el dueño del negocio.
    }));
  };

  const toggleTamano = (t) => {
    setForm((prev) => {
      const tamanos = prev.decant?.tamanos || [];
      const nuevos = tamanos.includes(t) ? tamanos.filter((x) => x !== t) : [...tamanos, t].sort((a, b) => a - b);
      return { ...prev, decant: { ...prev.decant, tamanos: nuevos } };
    });
  };

  const setPrecioTamano = (t, valor) => {
    setForm((prev) => ({
      ...prev,
      decant: { ...prev.decant, preciosPorTamano: { ...prev.decant?.preciosPorTamano, [t]: valor } },
    }));
  };

  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);

  const handleSubmit = () => {
    const nombre = sanitizeText(form.nombre, 120);
    const precioVenta = clampNumber(form.precioVenta, { min: 0 });
    if (!nombre) { setError("Ponle un nombre al perfume."); return; }
    if (!form.precioVenta || precioVenta <= 0) { setError("El precio de venta debe ser mayor a 0."); return; }
    setError("");
    onSave({
      ...form,
      nombre,
      casaPerfumera: sanitizeText(form.casaPerfumera, 120),
      marca: sanitizeText(form.marca, 120),
      concentracion: sanitizeText(form.concentracion, 60),
      sku: sanitizeText(form.sku, 60),
      codigoBarras: sanitizeText(form.codigoBarras, 60),
      proveedor: sanitizeText(form.proveedor, 120),
      notas: sanitizeText(form.notas, 600),
      descripcion: sanitizeText(form.descripcion, 600),
      inspiracion: sanitizeText(form.inspiracion, 120),
      ubicacionFisica: sanitizeText(form.ubicacionFisica, 120),
      observaciones: sanitizeText(form.observaciones, 600),
      imagenUrl: sanitizeUrl(form.imagenUrl),
      precioCompra: clampNumber(form.precioCompra, { min: 0 }),
      precioVenta,
      costoPromedio: clampNumber(form.costoPromedio, { min: 0 }) || clampNumber(form.precioCompra, { min: 0 }),
      cantidadDisponible: clampNumber(form.cantidadDisponible, { min: 0 }),
      cantidadMinima: clampNumber(form.cantidadMinima, { min: 0 }),
      presentacionMl: clampNumber(form.presentacionMl, { min: 0 }),
      decant: {
        ...form.decant,
        precioPorMl: clampNumber(form.decant?.precioPorMl, { min: 0 }),
        preciosPorTamano: Object.fromEntries(
          Object.entries(form.decant?.preciosPorTamano || {})
            .filter(([t]) => form.decant?.tamanos?.includes(Number(t)))
            .map(([t, v]) => [t, clampNumber(v, { min: 0 })])
        ),
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Editar perfume" : "Nuevo perfume"} maxWidth="max-w-2xl">
      <div className="space-y-6">
        {!initial && <PerfumeLookup onFound={applyLookup} />}

        <FormSection title="Lo esencial">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre" required className="sm:col-span-2"><TextInput value={form.nombre} onChange={set("nombre")} placeholder="Bleu de Chanel" /></Field>
            <Field label="Marca"><TextInput value={form.marca} onChange={set("marca")} placeholder="Chanel" /></Field>
            <Field label="Precio de venta" required><NumberInput value={form.precioVenta} onChange={set("precioVenta")} prefix="$" /></Field>
            <Field label="Cantidad disponible (frascos)" required><NumberInput value={form.cantidadDisponible} onChange={set("cantidadDisponible")} /></Field>
            <div className="sm:col-span-2">
              <ImageField value={form.imagenUrl} onChange={(v) => setForm((prev) => ({ ...prev, imagenUrl: v }))} label="Foto del perfume" folder="perfumes" slugSource={`${form.marca || ""} ${form.nombre || ""}`.trim()} />
            </div>
          </div>
        </FormSection>

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="text-sm font-medium text-neutral-600 hover:text-black flex items-center gap-1.5"
        >
          {showMore ? "Ocultar detalles adicionales" : "Más detalles (opcional)"}
          <span className={"transition-transform " + (showMore ? "rotate-180" : "")}>▾</span>
        </button>

        {showMore && (
          <div className="space-y-6">
            <FormSection title="Información adicional">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Casa perfumera"><TextInput value={form.casaPerfumera} onChange={set("casaPerfumera")} placeholder="Chanel" /></Field>
                <Field label="Género"><SelectInput value={form.genero} onChange={set("genero")} options={GENEROS} /></Field>
                <Field label="Tipo"><SelectInput value={form.tipo} onChange={set("tipo")} options={TIPOS} /></Field>
                <Field label="Concentración"><TextInput value={form.concentracion} onChange={set("concentracion")} placeholder="Ej. 20%" /></Field>
                <Field label="Presentación (ml)"><NumberInput value={form.presentacionMl} onChange={set("presentacionMl")} /></Field>
                <Field label="Temporada recomendada"><SelectInput value={form.temporada} onChange={set("temporada")} options={TEMPORADAS} /></Field>
                <Field label="Inspiración (si es un dupe)"><TextInput value={form.inspiracion} onChange={set("inspiracion")} /></Field>
              </div>
            </FormSection>

            <FormSection title="Costos y catalogación">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Precio de compra"><NumberInput value={form.precioCompra} onChange={set("precioCompra")} prefix="$" /></Field>
                <Field label="Fecha de compra"><input type="date" value={form.fechaCompra || ""} onChange={set("fechaCompra")} className={inputClass} /></Field>
                <Field label="SKU"><TextInput value={form.sku} onChange={set("sku")} /></Field>
                <Field label="Código de barras"><TextInput value={form.codigoBarras} onChange={set("codigoBarras")} /></Field>
                <Field label="Proveedor"><TextInput value={form.proveedor} onChange={set("proveedor")} /></Field>
                <Field label="Cantidad mínima"><NumberInput value={form.cantidadMinima} onChange={set("cantidadMinima")} /></Field>
                <Field label="Ubicación física" className="sm:col-span-2"><TextInput value={form.ubicacionFisica} onChange={set("ubicacionFisica")} placeholder="Anaquel A-3" /></Field>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" checked={form.activo} onChange={set("activo")} className="w-4 h-4 accent-red-600" /> Producto activo
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" checked={form.destacado || false} onChange={set("destacado")} className="w-4 h-4 accent-red-600" /> Destacar en el inicio de la tienda
                </label>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Tu calificación (opcional)</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, calificacion: prev.calificacion === n ? 0 : n }))}
                        className="text-2xl leading-none"
                        aria-label={`${n} estrellas`}
                      >
                        <span className={n <= (form.calificacion || 0) ? "text-gold-500" : "text-neutral-200"}>★</span>
                      </button>
                    ))}
                    {form.calificacion > 0 && <span className="text-xs text-neutral-400 ml-1">{form.calificacion}/5</span>}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">Se muestra en la tienda pública junto al producto. Basada en tu criterio o en lo que te comentan tus clientes.</p>
                </div>
              </div>
              {initial && initial.historialPrecios?.length > 1 && (
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-1.5">Historial de precios</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {initial.historialPrecios.slice(0, 5).map((h, i) => (
                      <div key={i} className="flex justify-between text-xs text-neutral-500">
                        <span>{fmtDate(h.fecha)}</span>
                        <span>Compra {money(h.precioCompra)} · Venta {money(h.precioVenta)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FormSection>

            <FormSection title="Venta en decants">
              <label className="flex items-center gap-2 text-sm text-neutral-700 mb-3">
                <input
                  type="checkbox"
                  checked={form.decant?.habilitado || false}
                  onChange={(e) => setForm((prev) => ({ ...prev, decant: { ...prev.decant, habilitado: e.target.checked } }))}
                  className="w-4 h-4 accent-red-600"
                />
                Este perfume se vende también en decants
              </label>
              {form.decant?.habilitado && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Tamaños disponibles</label>
                    <div className="flex flex-wrap gap-2">
                      {TAMANOS_DECANT.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTamano(t)}
                          className={"px-3 py-1.5 rounded-full text-sm border transition-colors " + (form.decant?.tamanos?.includes(t) ? "bg-black text-white border-black" : "border-neutral-300 text-neutral-600 hover:border-neutral-500")}
                        >
                          {t} ml
                        </button>
                      ))}
                    </div>
                  </div>
                  {form.decant?.tamanos?.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Precio de cada tamaño</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[...form.decant.tamanos].sort((a, b) => a - b).map((t) => (
                          <Field key={t} label={`${t} ml`}>
                            <NumberInput value={form.decant?.preciosPorTamano?.[t] ?? ""} onChange={(e) => setPrecioTamano(t, e.target.value)} prefix="$" />
                          </Field>
                        ))}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">No tiene que ser lineal por mililitro — captura el precio real de cada tamaño.</p>
                    </div>
                  )}
                  <Field label="Precio por ml de respaldo (opcional)">
                    <NumberInput value={form.decant?.precioPorMl} onChange={(e) => setForm((prev) => ({ ...prev, decant: { ...prev.decant, precioPorMl: e.target.value } }))} prefix="$" />
                  </Field>
                  <p className="text-xs text-neutral-500">El precio por ml de respaldo solo se usa si un tamaño no tiene un precio propio capturado arriba. El inventario en mililitros se activa desde la pestaña Decants, al "abrir un frasco".</p>
                </div>
              )}
            </FormSection>

            <FormSection title="Descripciones">
              <div className="grid grid-cols-1 gap-4">
                <Field label="Notas aromáticas"><TextArea value={form.notas} onChange={set("notas")} rows={2} placeholder="Bergamota, pimienta rosa, ámbar..." /></Field>
                <Field label="Descripción"><TextArea value={form.descripcion} onChange={set("descripcion")} rows={2} /></Field>
                <Field label="Observaciones"><TextArea value={form.observaciones} onChange={set("observaciones")} rows={2} /></Field>
              </div>
            </FormSection>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-3 text-center">{error}</p>}
      <div className="flex gap-3 mt-3 pt-4 border-t border-neutral-200">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Cancelar</button>
        <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-neutral-800">Guardar</button>
      </div>
    </Modal>
  );
}

export function ClienteFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || defaultClienteForm());
  const [error, setError] = useState("");
  useEffect(() => { setForm(initial || defaultClienteForm()); }, [initial, open]);
  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const handleSubmit = () => {
    const nombre = sanitizeText(form.nombre, 120);
    if (!nombre) { setError("Ponle un nombre al cliente."); return; }
    setError("");
    onSave({
      ...form,
      nombre,
      telefono: sanitizeText(form.telefono, 30),
      correo: sanitizeText(form.correo, 150),
      instagram: sanitizeText(form.instagram, 60),
      facebook: sanitizeText(form.facebook, 150),
      ciudad: sanitizeText(form.ciudad, 80),
      estado: sanitizeText(form.estado, 80),
      direccion: sanitizeText(form.direccion, 200),
      notas: sanitizeText(form.notas, 600),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Editar cliente" : "Nuevo cliente"} maxWidth="max-w-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre" required className="sm:col-span-2"><TextInput value={form.nombre} onChange={set("nombre")} /></Field>
        <Field label="Teléfono"><TextInput value={form.telefono} onChange={set("telefono")} /></Field>
        <Field label="Correo"><TextInput value={form.correo} onChange={set("correo")} /></Field>
        <Field label="Instagram"><TextInput value={form.instagram} onChange={set("instagram")} placeholder="@usuario" /></Field>
        <Field label="Facebook"><TextInput value={form.facebook} onChange={set("facebook")} /></Field>
        <Field label="Ciudad"><TextInput value={form.ciudad} onChange={set("ciudad")} /></Field>
        <Field label="Estado"><TextInput value={form.estado} onChange={set("estado")} /></Field>
        <Field label="Dirección" className="sm:col-span-2"><TextInput value={form.direccion} onChange={set("direccion")} /></Field>
        <Field label="Fecha de cumpleaños"><input type="date" value={form.fechaCumpleanos || ""} onChange={set("fechaCumpleanos")} className={inputClass} /></Field>
        <Field label="Notas" className="sm:col-span-2"><TextArea value={form.notas} onChange={set("notas")} rows={2} /></Field>
      </div>
      {error && <p className="text-xs text-red-600 mt-3 text-center">{error}</p>}
      <div className="flex gap-3 mt-3 pt-4 border-t border-neutral-200">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Cancelar</button>
        <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-neutral-800">Guardar</button>
      </div>
    </Modal>
  );
}

export function AjusteInventarioModal({ open, onClose, perfume, onSave }) {
  const [tipo, setTipo] = useState("entrada");
  const [cantidad, setCantidad] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => { if (open) { setTipo("entrada"); setCantidad(""); setPrecioCompra(""); setMotivo(""); } }, [open, perfume]);

  if (!perfume) return null;

  const tipos = [
    { v: "entrada", l: "Entrada (compra/reposición)" },
    { v: "salida", l: "Salida manual" },
    { v: "ajuste", l: "Ajuste de inventario físico" },
    { v: "merma", l: "Merma" },
    { v: "dañado", l: "Producto dañado" },
  ];

  const handleSubmit = () => {
    const cant = clampNumber(cantidad, { min: 0 });
    if (!cant || cant <= 0) return;
    const precio = clampNumber(precioCompra, { min: 0 });
    onSave(perfume.id, tipo, cant, sanitizeText(motivo, 300), tipo === "entrada" && precio > 0 ? precio : null);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Movimiento de inventario · ${perfume.nombre}`} maxWidth="max-w-md">
      <div className="space-y-4">
        <Field label="Tipo de movimiento">
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputClass}>
            {tipos.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </Field>
        <Field label="Cantidad (frascos)" required><NumberInput value={cantidad} onChange={(e) => setCantidad(e.target.value)} /></Field>
        {tipo === "entrada" && <Field label="Precio de compra de este lote (opcional)"><NumberInput value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} prefix="$" /></Field>}
        <Field label="Motivo / nota"><TextInput value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. Reposición proveedor X" /></Field>
        <p className="text-xs text-neutral-500">Stock actual: {perfume.cantidadDisponible} frasco(s)</p>
      </div>
      <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-200">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Cancelar</button>
        <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-neutral-800">Registrar</button>
      </div>
    </Modal>
  );
}

export function AbrirDecantModal({ open, onClose, perfume, onSave }) {
  const [ml, setMl] = useState("");
  useEffect(() => { if (open && perfume) setMl(String(perfume.presentacionMl || "")); }, [open, perfume]);
  if (!perfume) return null;
  const handleSubmit = () => { const m = clampNumber(ml, { min: 0 }); if (!m || m <= 0) return; onSave(perfume.id, m); };

  return (
    <Modal open={open} onClose={onClose} title={`Abrir frasco para decants · ${perfume.nombre}`} maxWidth="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm text-neutral-600">Esto descuenta 1 frasco del inventario general y lo convierte en mililitros disponibles para vender en decants.</p>
        <Field label="Mililitros a liberar"><NumberInput value={ml} onChange={(e) => setMl(e.target.value)} /></Field>
        <p className="text-xs text-neutral-500">Frascos disponibles: {perfume.cantidadDisponible}</p>
      </div>
      <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-200">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Cancelar</button>
        <button onClick={handleSubmit} disabled={perfume.cantidadDisponible < 1} className="flex-1 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed">Abrir frasco</button>
      </div>
    </Modal>
  );
}

export function TicketModal({ open, onClose, venta, cliente }) {
  if (!venta) return null;
  return (
    <Modal open={open} onClose={onClose} title="Venta registrada" maxWidth="max-w-sm">
      <div className="space-y-4">
        <div className="text-center border-b border-dashed border-neutral-300 pb-4">
          <p className="jaco-display text-2xl font-semibold tracking-[0.15em]">JACO SCENTS</p>
          <p className="text-xs text-neutral-500 mt-1">{new Date(venta.fecha).toLocaleString("es-MX")}</p>
          <p className="text-xs text-neutral-500">Ticket #{venta.id.slice(-6).toUpperCase()}</p>
        </div>
        <div className="text-sm text-neutral-700">Cliente: <span className="font-medium">{cliente?.nombre || "Mostrador"}</span></div>
        <div className="space-y-2">
          {venta.items.map((it, i) => (
            <div key={i} className="flex justify-between text-sm gap-3">
              <span className="text-neutral-700">{it.nombrePerfume} <span className="text-neutral-400">· {it.tipo === "decant" ? `${it.cantidad}ml` : `x${it.cantidad}`}</span></span>
              <span className="font-medium shrink-0">{money(it.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-neutral-300 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>{money(venta.subtotal)}</span></div>
          {venta.descuento > 0 && <div className="flex justify-between text-neutral-500"><span>Descuento</span><span>-{money(venta.descuento)}</span></div>}
          {venta.costoEnvio > 0 && <div className="flex justify-between text-neutral-500"><span>Envío</span><span>{money(venta.costoEnvio)}</span></div>}
          <div className="flex justify-between text-base font-bold pt-1"><span>Total</span><span>{money(venta.total)}</span></div>
        </div>
        <div className="flex justify-between items-center text-xs text-neutral-500 pt-2">
          <span>{venta.metodoPago}</span>
          <Badge tone={venta.estado === "Pagado" ? "success" : venta.estado === "Cancelado" ? "error" : "neutral"}>{venta.estado}</Badge>
        </div>
      </div>
      <button onClick={onClose} className="w-full mt-6 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-neutral-800">Cerrar</button>
    </Modal>
  );
}

export function AccesorioFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || defaultAccesorioForm());
  const [error, setError] = useState("");
  useEffect(() => { setForm(initial || defaultAccesorioForm()); }, [initial, open]);
  const set = (field) => (e) => {
    const val = e && e.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
    setForm((prev) => ({ ...prev, [field]: val }));
  };
  const handleSubmit = () => {
    const nombre = sanitizeText(form.nombre, 120);
    const precio = clampNumber(form.precio, { min: 0 });
    if (!nombre) { setError("Ponle un nombre al accesorio."); return; }
    if (!form.precio || precio <= 0) { setError("El precio debe ser mayor a 0."); return; }
    setError("");
    onSave({
      ...form,
      nombre,
      categoria: sanitizeText(form.categoria, 60),
      descripcion: sanitizeText(form.descripcion, 400),
      imagenUrl: sanitizeUrl(form.imagenUrl),
      precio,
      cantidadDisponible: clampNumber(form.cantidadDisponible, { min: 0 }),
      cantidadMinima: clampNumber(form.cantidadMinima, { min: 0 }),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Editar accesorio" : "Nuevo accesorio"} maxWidth="max-w-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre" required className="sm:col-span-2"><TextInput value={form.nombre} onChange={set("nombre")} placeholder="Decant de bolsillo 5ml" /></Field>
        <Field label="Categoría"><SelectInput value={form.categoria} onChange={set("categoria")} options={ACCESORIO_CATEGORIAS} /></Field>
        <Field label="Precio" required><NumberInput value={form.precio} onChange={set("precio")} prefix="$" /></Field>
        <Field label="Cantidad disponible"><NumberInput value={form.cantidadDisponible} onChange={set("cantidadDisponible")} /></Field>
        <Field label="Cantidad mínima"><NumberInput value={form.cantidadMinima} onChange={set("cantidadMinima")} /></Field>
        <div className="sm:col-span-2">
          <ImageField value={form.imagenUrl} onChange={(v) => setForm((prev) => ({ ...prev, imagenUrl: v }))} label="Foto del accesorio" folder="accesorios" slugSource={form.nombre || ""} />
        </div>
        <Field label="Descripción" className="sm:col-span-2"><TextArea value={form.descripcion} onChange={set("descripcion")} rows={2} /></Field>
        <label className="flex items-center gap-2 text-sm text-neutral-700 sm:col-span-2">
          <input type="checkbox" checked={form.activo} onChange={set("activo")} className="w-4 h-4 accent-red-600" /> Producto activo
        </label>
      </div>
      {error && <p className="text-xs text-red-600 mt-3 text-center">{error}</p>}
      <div className="flex gap-3 mt-3 pt-4 border-t border-neutral-200">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Cancelar</button>
        <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-neutral-800">Guardar</button>
      </div>
    </Modal>
  );
}
