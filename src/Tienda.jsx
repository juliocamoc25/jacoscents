import React, { useState } from "react";
import StoreLayout from "./store/StoreLayout";
import TiendaHome from "./store/TiendaHome";
import PerfumesPublicView from "./store/PerfumesPublicView";
import DecantsPublicView from "./store/DecantsPublicView";
import AccesoriosPublicView from "./store/AccesoriosPublicView";
import BusquedaView from "./store/BusquedaView";
import RecomendadorView from "./store/RecomendadorView";
import CartModal from "./store/CartModal";
import TerminosCondicionesView from "./store/TerminosCondicionesView";
import AvisoPrivacidadView from "./store/AvisoPrivacidadView";
import { usePublicCart } from "./hooks/usePublicCart";
import { money, whatsappLink } from "./utils";
import { WHATSAPP_NUMBER } from "./constants";

// Tienda pública: solo lectura sobre los datos del negocio (perfumes,
// decants, accesorios). No expone precios de compra, costos, clientes ni
// ventas — únicamente lo que un cliente debe ver.
export default function Tienda({ perfumes, accesorios, onRequestAdmin, crearPedidoWeb }) {
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const cart = usePublicCart();

  const handleSearch = (q) => {
    setQuery(q);
    setPage("buscar");
  };

  const armarMensajePedido = (items, envio) => {
    const lineas = items.map((it) =>
      `• ${it.nombre} — ${it.tipo === "decant" ? `${it.ml} ml` : `${it.cantidad} frasco(s)`}${it.tipo === "decant" ? ` x${it.cantidad}` : ""} — ${money(it.precioUnitario * it.cantidad)}`
    );
    return [
      "¡Hola! Quiero confirmar este pedido:",
      "",
      ...lineas,
      "",
      `Total: ${money(items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0))}`,
      `Método de pago: ${envio.metodoPago}`,
      "",
      envio.entrega === "recoger" ? "Voy a recoger en persona." : "Datos de envío:",
      `${envio.nombre} · ${envio.telefono}`,
      envio.entrega === "recoger" ? "" : [envio.direccion, envio.colonia, envio.ciudad, envio.codigoPostal].filter(Boolean).join(", "),
      envio.referencias ? `Referencias: ${envio.referencias}` : "",
      envio.notas ? `Notas: ${envio.notas}` : "",
    ].filter(Boolean).join("\n");
  };

  // Devuelve true/false para que CartModal sepa si de verdad se guardó el
  // pedido antes de abrir WhatsApp, limpiar el carrito y mostrar "listo" —
  // antes esto pasaba sin importar si crearPedidoWeb fallaba o no.
  const onSubmitOrder = async (envio) => {
    const items = cart.items;
    if (crearPedidoWeb) {
      const pedidoGuardado = await crearPedidoWeb({
        items: items.map((it) => ({ perfumeId: it.id, nombre: it.nombre, tipo: it.tipo, ml: it.ml || null, cantidad: it.cantidad, precioUnitario: it.precioUnitario })),
        total: cart.total,
        envio,
      });
      if (!pedidoGuardado) return false;
    }
    const mensaje = armarMensajePedido(items, envio);
    window.open(whatsappLink(WHATSAPP_NUMBER, mensaje), "_blank");
    cart.clear();
    return true;
  };

  return (
    <StoreLayout page={page} onNavigate={setPage} onRequestAdmin={onRequestAdmin} onSearch={handleSearch} cartCount={cart.count} onOpenCart={() => setCartOpen(true)}>
      {page === "home" && <TiendaHome perfumes={perfumes} accesorios={accesorios} onNavigate={setPage} />}
      {page === "perfumes" && <PerfumesPublicView perfumes={perfumes} onAddToCart={cart.add} />}
      {page === "decants" && <DecantsPublicView perfumes={perfumes} onAddToCart={cart.add} />}
      {page === "accesorios" && <AccesoriosPublicView accesorios={accesorios} onAddToCart={cart.add} />}
      {page === "buscar" && <BusquedaView query={query} perfumes={perfumes} accesorios={accesorios} onAddToCart={cart.add} />}
      {page === "recomendador" && <RecomendadorView perfumes={perfumes} onNavigate={setPage} />}
      {page === "terminos" && <TerminosCondicionesView onNavigate={setPage} />}
      {page === "privacidad" && <AvisoPrivacidadView onNavigate={setPage} />}

      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onSubmitOrder={onSubmitOrder} onNavigate={setPage} />
    </StoreLayout>
  );
}
