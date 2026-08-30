export const TIPOS = ["EDT", "EDP", "Parfum", "Elixir", "Extrait", "Cologne"];
export const GENEROS = ["Masculino", "Femenino", "Unisex"];
export const TEMPORADAS = ["Primavera", "Verano", "Otoño", "Invierno", "Todo el año"];
export const PRESENTACIONES = [30, 50, 75, 100, 125, 150, 200];
export const TAMANOS_DECANT = [2, 3, 5, 10, 15, 20, 30];
export const METODOS_PAGO = ["Efectivo", "Transferencia", "Mercado Pago", "PayPal", "Tarjeta"];
export const ESTADOS_VENTA = ["Pagado", "Pendiente", "Cancelado", "Enviado", "Entregado"];

export const ACCESORIO_CATEGORIAS = [
  "Decant de bolsillo", "Atomizador recargable", "Estuche", "Set de viaje", "Cargador de decants", "Otro",
];

// Número de WhatsApp para el CTA de "comprar" en la tienda pública (con lada de país, sin +).
// Cámbialo por el número real del negocio.
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "5215500000000";

// Hash (PBKDF2) de la contraseña de administrador — NUNCA la contraseña en
// texto plano. Genera el tuyo con: node scripts/generar-hash-admin.mjs
// Si esto está vacío, el panel de administración queda bloqueado por diseño
// (mejor eso a arrancar con una contraseña de fábrica conocida por cualquiera
// que haya visto este código).
// La contraseña de administrador ya NO se expone al navegador — vive
// únicamente en el servidor (variable de entorno ADMIN_PASSWORD_HASH, sin
// prefijo VITE_). Ver api/_lib/auth.js.
