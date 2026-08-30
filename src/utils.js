export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const money = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(n) || 0);

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const cx = (...a) => a.filter(Boolean).join(" ");

export const whatsappLink = (numero, mensaje) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

// Estado de stock para mostrar en la tienda pública: "agotado", "bajo" o null (normal).
export const stockStateOf = (cantidadDisponible, cantidadMinima) => {
  if (cantidadDisponible === 0) return "agotado";
  if (cantidadDisponible <= (cantidadMinima || 0)) return "bajo";
  return null;
};

// Precio de un tamaño de decant en particular. Prioriza el precio exacto
// capturado por tamaño (decant.preciosPorTamano, tal como se definió en la
// lista de precios del negocio — no siempre es lineal por mililitro).
// Si un perfume no tiene ese tamaño capturado, usa precioPorMl * ml como
// respaldo (perfumes agregados manualmente sin tabla de precios por tamaño).
export const precioDecant = (decant, tamanoMl) => {
  if (!decant) return 0;
  const exacto = decant.preciosPorTamano ? decant.preciosPorTamano[String(tamanoMl)] : undefined;
  if (exacto !== undefined && exacto !== null && exacto !== "") return Math.round(Number(exacto));
  return Math.round((decant.precioPorMl || 0) * tamanoMl);
};

// Convierte un texto (ej. "Marca Nombre") en un nombre de archivo seguro:
// minúsculas, sin acentos, sin espacios ni símbolos raros. Se usa para que
// las rutas de imágenes locales (/img/perfumes/<slug>.jpg) se generen
// siempre de la misma forma, tanto para el catálogo importado como para
// perfumes nuevos que se den de alta desde el panel.
export const slugify = (s) => {
  return String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};
