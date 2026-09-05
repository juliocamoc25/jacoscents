// Endpoint sin contraseña: lo usa la tienda pública (cualquier visitante).
// Solo expone lo que un cliente necesita ver, nunca costos, proveedores ni
// datos internos.
import { getCollections } from "./_lib/db.js";
import { store } from "./_lib/store.js";

const CAMPOS_PUBLICOS_PERFUME = [
  "id", "nombre", "casaPerfumera", "marca", "genero", "tipo", "concentracion",
  "presentacionMl", "imagenUrl", "notas", "notasSalida", "notasCorazon", "notasFondo",
  "descripcion", "inspiracion", "temporada",
  "precioVenta", "cantidadDisponible", "cantidadMinima", "activo", "destacado",
  "calificacion", "tieneFrascoCompleto", "decant",
];
const CAMPOS_PUBLICOS_ACCESORIO = ["id", "nombre", "categoria", "descripcion", "imagenUrl", "precio", "cantidadDisponible", "activo"];

function pick(obj, campos) {
  const out = {};
  for (const c of campos) out[c] = obj[c];
  return out;
}

export default async function handler(req, res) {
  const { perfumes, accesorios, pedidos } = await getCollections();

  if (req.method === "GET") {
    const [p, a] = await Promise.all([perfumes.find({}).toArray(), accesorios.find({}).toArray()]);
    const strip = (doc) => { const { _id, ...rest } = doc; return { id: _id, ...rest }; };
    return res.status(200).json({
      perfumes: p.map((d) => pick(strip(d), CAMPOS_PUBLICOS_PERFUME)),
      accesorios: a.map((d) => pick(strip(d), CAMPOS_PUBLICOS_ACCESORIO)),
    });
  }

  if (req.method === "POST") {
    const { action, payload } = req.body || {};
    if (action === "crear-pedido") {
      const pedido = await store.crearPedidoWeb(payload);
      return res.status(200).json({ pedido });
    }
    return res.status(400).json({ error: "Acción no reconocida" });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
