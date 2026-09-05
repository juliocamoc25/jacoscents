// Todas las operaciones del panel de administración pasan por aquí.
// Requiere un token válido (Authorization: Bearer <token>, obtenido en
// /api/auth) — sin eso, ninguna operación se ejecuta.
import { isAuthorized } from "./_lib/auth.js";
import { store } from "./_lib/store.js";

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "No autorizado. Inicia sesión de nuevo." });
  }

  if (req.method === "GET") {
    const data = await store.getAllData();
    return res.status(200).json(data);
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { action, payload } = req.body || {};
  try {
    switch (action) {
      case "guardar-perfume":
        await store.guardarPerfume(payload.data, payload.editingId || null);
        break;
      case "eliminar-perfume":
        await store.eliminarPerfume(payload.id);
        break;
      case "importar-perfumes":
        await store.importarPerfumes(payload.lista);
        break;
      case "duplicar-perfume":
        await store.duplicarPerfume(payload.id);
        break;
      case "ajustar-inventario":
        await store.ajustarInventario(payload.perfumeId, payload.tipo, payload.cantidad, payload.motivo, payload.precioCompraNuevo);
        break;
      case "abrir-decant": {
        const r = await store.abrirFrascoDecant(payload.perfumeId, payload.ml);
        if (r?.error) return res.status(400).json({ error: r.error });
        break;
      }
      case "guardar-cliente":
        await store.guardarCliente(payload.data, payload.editingId || null);
        break;
      case "eliminar-cliente":
        await store.eliminarCliente(payload.id);
        break;
      case "guardar-accesorio":
        await store.guardarAccesorio(payload.data, payload.editingId || null);
        break;
      case "eliminar-accesorio":
        await store.eliminarAccesorio(payload.id);
        break;
      case "completar-venta": {
        const r = await store.completarVenta(payload);
        if (r?.error) return res.status(400).json({ error: r.error });
        const data = await store.getAllData();
        return res.status(200).json({ ...data, ventaCompletada: r.venta });
      }
      case "convertir-pedido-en-venta": {
        const r = await store.convertirPedidoEnVenta(payload.pedidoId, { metodoPago: payload.metodoPago, estado: payload.estado });
        if (r?.error) return res.status(400).json({ error: r.error });
        const data = await store.getAllData();
        return res.status(200).json({ ...data, ventaCompletada: r.venta });
      }
      case "actualizar-estado-pedido":
        await store.actualizarEstadoPedidoWeb(payload.id, payload.estado);
        break;
      case "eliminar-pedido":
        await store.eliminarPedidoWeb(payload.id);
        break;
      case "restaurar-datos":
        await store.restaurarDatos(payload);
        break;
      case "borrar-todo":
        await store.borrarTodo();
        break;
      default:
        return res.status(400).json({ error: "Acción no reconocida: " + action });
    }
  } catch (err) {
    console.error("Error en /api/admin:", action, err);
    return res.status(500).json({ error: "Ocurrió un error guardando los datos. Intenta de nuevo." });
  }

  const data = await store.getAllData();
  return res.status(200).json(data);
}
