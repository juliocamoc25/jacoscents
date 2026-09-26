import React, { useState } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, CheckCircle2 } from "lucide-react";
import { Modal } from "../components/UI";
import { money, whatsappLink } from "../utils";
import { WHATSAPP_NUMBER, METODOS_PAGO } from "../constants";
import { sanitizeText } from "../security";

function CartStep({ cart, onClose, onCheckout }) {
  if (cart.items.length === 0) {
    return (
      <div className="text-center py-10">
        <ShoppingBag size={32} className="text-neutral-300 mx-auto mb-3" />
        <p className="text-sm text-neutral-500">Tu pedido está vacío. Agrega productos desde el catálogo.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {cart.items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-3 border-b border-bone-200 pb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ink to-wine-700 shrink-0 overflow-hidden">
              {it.imagenUrl && <img src={it.imagenUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{it.nombre}</p>
              <p className="text-xs text-neutral-500">{it.tipo === "decant" ? `Decant · ${it.ml} ml` : "Frasco completo"} · {money(it.precioUnitario)}</p>
            </div>
            {it.tipo === "frasco" ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => cart.updateQty(idx, -1)} className="w-6 h-6 rounded-full border border-bone-300 flex items-center justify-center hover:bg-bone-100"><Minus size={11} /></button>
                <span className="text-sm w-5 text-center">{it.cantidad}</span>
                <button onClick={() => cart.updateQty(idx, 1)} className="w-6 h-6 rounded-full border border-bone-300 flex items-center justify-center hover:bg-bone-100"><Plus size={11} /></button>
              </div>
            ) : (
              <span className="text-sm text-neutral-500 shrink-0">x{it.cantidad}</span>
            )}
            <button onClick={() => cart.remove(idx)} className="text-neutral-300 hover:text-wine-600 shrink-0"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-bone-300">
        <span className="text-sm font-semibold text-neutral-600">Total</span>
        <span className="jaco-display text-xl font-bold text-ink">{money(cart.total)}</span>
      </div>
      <button onClick={onCheckout} className="w-full mt-4 py-3 rounded-lg bg-black text-white font-semibold hover:bg-neutral-800">
        Continuar con el pedido
      </button>
    </div>
  );
}

function CheckoutStep({ cart, onBack, onConfirm, enviando, onVerPagina }) {
  const [form, setForm] = useState({ entrega: "domicilio", nombre: "", telefono: "", direccion: "", colonia: "", ciudad: "", codigoPostal: "", referencias: "", metodoPago: METODOS_PAGO[0], notas: "" });
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));
  const esRecoger = form.entrega === "recoger";

  const submit = () => {
    const nombre = sanitizeText(form.nombre, 100);
    const telefono = sanitizeText(form.telefono, 30);
    const direccion = sanitizeText(form.direccion, 200);
    const colonia = sanitizeText(form.colonia, 100);
    const codigoPostal = sanitizeText(form.codigoPostal, 10);
    const referencias = sanitizeText(form.referencias, 200);
    if (!nombre || !telefono) {
      setError("Nombre y teléfono son necesarios para poder confirmarte tu pedido.");
      return;
    }
    if (!esRecoger && !direccion) {
      setError("La dirección es necesaria para poder enviarte tu pedido.");
      return;
    }
    if (!aceptaTerminos) {
      setError("Necesitas aceptar los términos y condiciones para continuar.");
      return;
    }
    setError("");
    onConfirm({ ...form, nombre, telefono, direccion, colonia, codigoPostal, referencias });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 p-1 bg-bone-100 rounded-lg">
        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, entrega: "domicilio" }))}
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${!esRecoger ? "bg-white shadow-sm text-ink" : "text-neutral-500"}`}
        >
          Envío a domicilio
        </button>
        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, entrega: "recoger" }))}
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${esRecoger ? "bg-white shadow-sm text-ink" : "text-neutral-500"}`}
        >
          Recojo en persona
        </button>
      </div>
      {esRecoger && <p className="text-xs text-neutral-500">Perfecto — solo necesitamos tu nombre y teléfono para apartarte tu pedido y coordinar contigo cuándo pasar por él.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Nombre completo</label>
          <input value={form.nombre} onChange={set("nombre")} className="w-full px-3 py-2.5 rounded-lg border border-bone-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
        </div>
        <div className={esRecoger ? "sm:col-span-2" : ""}>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Teléfono</label>
          <input value={form.telefono} onChange={set("telefono")} className="w-full px-3 py-2.5 rounded-lg border border-bone-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
        </div>

        {!esRecoger && (
          <>
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Código postal</label>
              <input value={form.codigoPostal} onChange={set("codigoPostal")} inputMode="numeric" placeholder="Ej. 58000" className="w-full px-3 py-2.5 rounded-lg border border-bone-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Dirección de envío</label>
              <input value={form.direccion} onChange={set("direccion")} placeholder="Calle y número" className="w-full px-3 py-2.5 rounded-lg border border-bone-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Colonia</label>
              <input value={form.colonia} onChange={set("colonia")} className="w-full px-3 py-2.5 rounded-lg border border-bone-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Ciudad</label>
              <input value={form.ciudad} onChange={set("ciudad")} className="w-full px-3 py-2.5 rounded-lg border border-bone-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Entre calles / referencias</label>
              <input value={form.referencias} onChange={set("referencias")} placeholder="Ej. entre calle X y Y, casa de portón negro" className="w-full px-3 py-2.5 rounded-lg border border-bone-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Método de pago</label>
          <select value={form.metodoPago} onChange={set("metodoPago")} className="w-full px-3 py-2.5 rounded-lg border border-bone-300 text-sm bg-white">
            {METODOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Notas (opcional)</label>
          <textarea value={form.notas} onChange={set("notas")} rows={2} className="w-full px-3 py-2.5 rounded-lg border border-bone-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
        </div>
      </div>

      <label className="flex items-start gap-2 text-xs text-neutral-600 pt-1">
        <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} className="w-4 h-4 mt-0.5 accent-black shrink-0" />
        <span>
          Acepto los{" "}
          <button type="button" onClick={() => onVerPagina("terminos")} className="underline hover:text-black">Términos y condiciones</button>
          {" "}y el{" "}
          <button type="button" onClick={() => onVerPagina("privacidad")} className="underline hover:text-black">Aviso de privacidad</button>.
        </span>
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button onClick={onBack} disabled={enviando} className="flex-1 py-2.5 rounded-lg border border-bone-300 text-neutral-700 font-medium hover:bg-bone-50 disabled:opacity-50">Regresar</button>
        <button onClick={submit} disabled={enviando} className="flex-1 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-neutral-800 disabled:opacity-60">
          {enviando ? "Enviando..." : "Enviar pedido"}
        </button>
      </div>
    </div>
  );
}

function DoneStep({ onClose }) {
  return (
    <div className="text-center py-8">
      <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
      <p className="text-base font-semibold text-ink mb-1">¡Tu pedido está listo!</p>
      <p className="text-sm text-neutral-500 mb-5">Te abrimos WhatsApp con el resumen para que lo confirmes. En cuanto lo recibamos, coordinamos el envío contigo.</p>
      <button onClick={onClose} className="px-6 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800">Cerrar</button>
    </div>
  );
}

export default function CartModal({ open, onClose, cart, onSubmitOrder, onNavigate }) {
  const [step, setStep] = useState("cart"); // cart | checkout | done
  const [enviando, setEnviando] = useState(false);

  const close = () => { onClose(); setTimeout(() => setStep("cart"), 300); };

  const confirmar = async (envio) => {
    setEnviando(true);
    const ok = await onSubmitOrder(envio);
    setEnviando(false);
    // Si falló, nos quedamos en "checkout" — el toast de error ya se muestra
    // desde useJacoData, y el cliente puede corregir e intentar de nuevo sin
    // perder lo que ya había escrito.
    if (ok) setStep("done");
  };

  const verPagina = (pagina) => {
    close();
    onNavigate?.(pagina);
  };

  const titulos = { cart: "Tu pedido", checkout: "Datos de envío", done: "" };

  return (
    <Modal open={open} onClose={close} title={titulos[step]} maxWidth="max-w-lg">
      {step === "cart" && <CartStep cart={cart} onClose={close} onCheckout={() => setStep("checkout")} />}
      {step === "checkout" && <CheckoutStep cart={cart} onBack={() => setStep("cart")} onConfirm={confirmar} enviando={enviando} onVerPagina={verPagina} />}
      {step === "done" && <DoneStep onClose={close} />}
    </Modal>
  );
}
