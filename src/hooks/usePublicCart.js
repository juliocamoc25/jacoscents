import { useState } from "react";

// Carrito de la tienda pública. Vive en memoria (no en localStorage): si el
// cliente cierra la pestaña se pierde, igual que un carrito de compras común
// antes de pagar. Es intencional — es solo el paso previo a mandar el pedido
// por WhatsApp, no un sistema de cuentas de cliente.
export function usePublicCart() {
  const [items, setItems] = useState([]);

  const keyOf = (it) => `${it.kind}-${it.id}-${it.tipo}-${it.ml || ""}`;

  const add = (item) => {
    setItems((prev) => {
      const k = keyOf(item);
      const idx = prev.findIndex((it) => keyOf(it) === k);
      if (idx !== -1) {
        const nuevos = [...prev];
        nuevos[idx] = { ...nuevos[idx], cantidad: nuevos[idx].cantidad + item.cantidad };
        return nuevos;
      }
      return [...prev, item];
    });
  };

  const updateQty = (idx, delta) => {
    setItems((prev) => {
      const nuevos = [...prev];
      const nueva = Math.max(1, nuevos[idx].cantidad + delta);
      nuevos[idx] = { ...nuevos[idx], cantidad: nueva };
      return nuevos;
    });
  };

  const remove = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const clear = () => setItems([]);

  const count = items.reduce((s, it) => s + it.cantidad, 0);
  const total = items.reduce((s, it) => s + it.precioUnitario * it.cantidad, 0);

  return { items, add, updateQty, remove, clear, count, total };
}
