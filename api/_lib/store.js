// Toda la lógica de negocio del panel, ahora en el servidor. Es un traslado
// fiel de lo que antes vivía en src/hooks/useJacoData.js (mismas reglas,
// mismos cálculos) pero operando contra MongoDB en vez de localStorage —
// así el inventario y las ventas son los mismos sin importar quién entre ni
// desde qué dispositivo.
import { getCollections } from "./db.js";
import { randomId } from "./auth.js";

const nowIso = () => new Date().toISOString();
const uid = () => randomId("jc_");

async function getAllData() {
  const { perfumes, accesorios, clientes, ventas, movimientos, pedidos } = await getCollections();
  const [perfumesArr, accesoriosArr, clientesArr, ventasArr, movimientosArr, pedidosArr] = await Promise.all([
    perfumes.find({}).sort({ _creadoEn: -1 }).toArray(),
    accesorios.find({}).sort({ _creadoEn: -1 }).toArray(),
    clientes.find({}).sort({ _creadoEn: -1 }).toArray(),
    ventas.find({}).sort({ fecha: -1 }).toArray(),
    movimientos.find({}).sort({ fecha: -1 }).limit(500).toArray(),
    pedidos.find({}).sort({ fecha: -1 }).toArray(),
  ]);
  const strip = (doc) => { const { _id, _creadoEn, ...rest } = doc; return { id: _id, ...rest }; };
  return {
    perfumes: perfumesArr.map(strip),
    accesorios: accesoriosArr.map(strip),
    clientes: clientesArr.map(strip),
    ventas: ventasArr.map(strip),
    movimientos: movimientosArr.map(strip),
    pedidosWeb: pedidosArr.map(strip),
  };
}

async function crearMovimiento(col, { perfumeId, nombrePerfume, tipo, cantidad, motivo }) {
  await col.insertOne({ _id: uid(), fecha: nowIso(), perfumeId, nombrePerfume, tipo, cantidad, motivo, _creadoEn: Date.now() });
}

/* ---------------- Perfumes ---------------- */

async function guardarPerfume(payload, editingId) {
  const { perfumes, movimientos } = await getCollections();
  if (editingId) {
    const anterior = await perfumes.findOne({ _id: editingId });
    if (!anterior) return;
    let historial = anterior.historialPrecios || [];
    if (payload.precioCompra !== anterior.precioCompra || payload.precioVenta !== anterior.precioVenta) {
      historial = [{ fecha: nowIso(), precioCompra: payload.precioCompra, precioVenta: payload.precioVenta }, ...historial];
    }
    await perfumes.updateOne({ _id: editingId }, { $set: { ...payload, historialPrecios: historial } });
  } else {
    const id = uid();
    const doc = {
      _id: id, ...payload,
      historialPrecios: [{ fecha: nowIso(), precioCompra: payload.precioCompra, precioVenta: payload.precioVenta }],
      _creadoEn: Date.now(),
    };
    await perfumes.insertOne(doc);
    if (payload.cantidadDisponible > 0) {
      await crearMovimiento(movimientos, { perfumeId: id, nombrePerfume: payload.nombre, tipo: "entrada", cantidad: payload.cantidadDisponible, motivo: "Alta inicial de producto" });
    }
  }
}

async function eliminarPerfume(id) {
  const { perfumes } = await getCollections();
  await perfumes.deleteOne({ _id: id });
}

async function importarPerfumes(lista) {
  const { perfumes, movimientos } = await getCollections();
  const docs = lista.map((data) => ({
    _id: uid(), ...data,
    historialPrecios: [{ fecha: nowIso(), precioCompra: data.precioCompra || 0, precioVenta: data.precioVenta }],
    _creadoEn: Date.now(),
  }));
  if (docs.length) await perfumes.insertMany(docs);
  const conStock = docs.filter((d) => d.cantidadDisponible > 0);
  for (const d of conStock) {
    await crearMovimiento(movimientos, { perfumeId: d._id, nombrePerfume: d.nombre, tipo: "entrada", cantidad: d.cantidadDisponible, motivo: "Importación desde Excel" });
  }
}

async function duplicarPerfume(perfumeId) {
  const { perfumes } = await getCollections();
  const p = await perfumes.findOne({ _id: perfumeId });
  if (!p) return;
  const { _id, _creadoEn, ...rest } = p;
  const copia = {
    _id: uid(), ...rest, nombre: rest.nombre + " (copia)", sku: "", codigoBarras: "",
    cantidadDisponible: 0,
    decant: rest.decant ? { ...rest.decant, mlDisponible: 0, mlTotalAbierto: 0 } : rest.decant,
    historialPrecios: [{ fecha: nowIso(), precioCompra: rest.precioCompra, precioVenta: rest.precioVenta }],
    _creadoEn: Date.now(),
  };
  await perfumes.insertOne(copia);
}

async function ajustarInventario(perfumeId, tipo, cantidad, motivo, precioCompraNuevo) {
  const { perfumes, movimientos } = await getCollections();
  const p = await perfumes.findOne({ _id: perfumeId });
  if (!p) return;
  let nuevaCantidad = p.cantidadDisponible;
  let nuevoCosto = p.costoPromedio;
  let historial = p.historialPrecios || [];
  if (tipo === "entrada") {
    nuevaCantidad += cantidad;
    if (precioCompraNuevo) {
      const totalAnterior = p.cantidadDisponible * (p.costoPromedio || p.precioCompra || 0);
      nuevoCosto = nuevaCantidad > 0 ? (totalAnterior + cantidad * precioCompraNuevo) / nuevaCantidad : precioCompraNuevo;
      historial = [{ fecha: nowIso(), precioCompra: precioCompraNuevo, precioVenta: p.precioVenta }, ...historial];
    }
  } else {
    nuevaCantidad = Math.max(0, nuevaCantidad - cantidad);
  }
  await perfumes.updateOne({ _id: perfumeId }, { $set: { cantidadDisponible: nuevaCantidad, costoPromedio: nuevoCosto, historialPrecios: historial } });
  await crearMovimiento(movimientos, { perfumeId, nombrePerfume: p.nombre, tipo, cantidad, motivo: motivo || "" });
}

async function abrirFrascoDecant(perfumeId, ml) {
  const { perfumes, movimientos } = await getCollections();
  // Condición atómica: solo resta el frasco si en ese instante sigue habiendo
  // al menos 1 disponible — evita que dos aperturas simultáneas dejen el
  // inventario en negativo.
  const res = await perfumes.findOneAndUpdate(
    { _id: perfumeId, cantidadDisponible: { $gte: 1 } },
    [
      {
        $set: {
          cantidadDisponible: { $subtract: ["$cantidadDisponible", 1] },
          "decant.habilitado": true,
          "decant.mlTotalAbierto": { $add: [{ $ifNull: ["$decant.mlTotalAbierto", 0] }, ml] },
          "decant.mlDisponible": { $add: [{ $ifNull: ["$decant.mlDisponible", 0] }, ml] },
        },
      },
    ],
    { returnDocument: "after" }
  );
  const doc = res?.value || res; // compat entre versiones del driver
  if (!doc) return { error: "Sin frascos disponibles para abrir" };
  await crearMovimiento(movimientos, { perfumeId, nombrePerfume: doc.nombre, tipo: "apertura_decant", cantidad: 1, motivo: `Frasco abierto para decants (${ml} ml)` });
  return { ok: true };
}

/* ---------------- Clientes ---------------- */

async function guardarCliente(payload, editingId) {
  const { clientes } = await getCollections();
  if (editingId) {
    await clientes.updateOne({ _id: editingId }, { $set: payload });
  } else {
    await clientes.insertOne({ _id: uid(), ...payload, _creadoEn: Date.now() });
  }
}

async function eliminarCliente(id) {
  const { clientes } = await getCollections();
  await clientes.deleteOne({ _id: id });
}

/* ---------------- Accesorios ---------------- */

async function guardarAccesorio(payload, editingId) {
  const { accesorios } = await getCollections();
  if (editingId) {
    await accesorios.updateOne({ _id: editingId }, { $set: payload });
  } else {
    await accesorios.insertOne({ _id: uid(), ...payload, _creadoEn: Date.now() });
  }
}

async function eliminarAccesorio(id) {
  const { accesorios } = await getCollections();
  await accesorios.deleteOne({ _id: id });
}

/* ---------------- Ventas (punto de venta interno) ---------------- */

function precioDecant(decant, tamanoMl) {
  if (!decant) return 0;
  const exacto = decant.preciosPorTamano ? decant.preciosPorTamano[String(tamanoMl)] : undefined;
  if (exacto !== undefined && exacto !== null && exacto !== "") return Math.round(Number(exacto));
  return Math.round((decant.precioPorMl || 0) * tamanoMl);
}

// Descuenta el inventario de UN item del carrito de venta (perfume en
// frasco, decant, o accesorio) de forma atómica — la condición de stock va
// en el mismo filtro del update, así dos ventas simultáneas nunca dejan el
// inventario en negativo. Regresa el item con su costo de referencia
// (para calcular ganancia) o { error } si no había suficiente disponible.
async function resolverItemVenta(item, collections) {
  const { perfumes, accesorios } = collections;

  if (item.kind === "accesorio") {
    const res = await accesorios.findOneAndUpdate(
      { _id: item.perfumeId, cantidadDisponible: { $gte: item.cantidad } },
      { $inc: { cantidadDisponible: -item.cantidad } },
      { returnDocument: "before" }
    );
    const a = res?.value || res;
    if (!a) return { error: `Sin stock suficiente de "${item.nombrePerfume}"` };
    // Los accesorios todavía no capturan un costo de compra en el panel;
    // si en el futuro se agrega (costoPromedio/precioCompra), esto ya lo
    // toma en cuenta automáticamente para la ganancia.
    const costoUnit = a.costoPromedio || a.precioCompra || 0;
    return { item: { ...item, costoUnitarioSnapshot: costoUnit, costoTotalSnapshot: costoUnit * item.cantidad } };
  }

  if (item.tipo === "frasco") {
    const res = await perfumes.findOneAndUpdate(
      { _id: item.perfumeId, cantidadDisponible: { $gte: item.cantidad } },
      { $inc: { cantidadDisponible: -item.cantidad } },
      { returnDocument: "before" }
    );
    const p = res?.value || res;
    if (!p) return { error: `Sin stock suficiente de "${item.nombrePerfume}"` };
    const costoUnit = p.costoPromedio || p.precioCompra || 0;
    return { item: { ...item, costoUnitarioSnapshot: costoUnit, costoTotalSnapshot: costoUnit * item.cantidad } };
  }

  // Decant
  const res = await perfumes.findOneAndUpdate(
    { _id: item.perfumeId, "decant.mlDisponible": { $gte: item.cantidad } },
    { $inc: { "decant.mlDisponible": -item.cantidad } },
    { returnDocument: "before" }
  );
  const p = res?.value || res;
  if (!p) return { error: `No hay suficiente ml disponible de "${item.nombrePerfume}"` };
  const costoPorMl = (p.costoPromedio || p.precioCompra || 0) / (p.presentacionMl || 1);
  return { item: { ...item, costoUnitarioSnapshot: costoPorMl, costoTotalSnapshot: costoPorMl * item.cantidad } };
}

// `items` = el carrito armado del lado del cliente:
// [{ kind: "perfume"|"accesorio", perfumeId, tipo, cantidad, precioUnitario, subtotal, nombrePerfume, marca }]
async function completarVenta({ items, clienteId, clienteInvitado, descuento, cupon, costoEnvio, metodoPago, estado, pedidoOrigenId }) {
  const collections = await getCollections();
  const { ventas, movimientos } = collections;
  if (!items || items.length === 0) return { error: "El carrito está vacío" };

  const itemsFinal = [];
  for (const item of items) {
    const resultado = await resolverItemVenta(item, collections);
    if (resultado.error) return { error: resultado.error };
    itemsFinal.push(resultado.item);
  }

  const subtotal = itemsFinal.reduce((s, i) => s + i.subtotal, 0);
  const costoTotal = itemsFinal.reduce((s, i) => s + i.costoTotalSnapshot, 0);
  const total = Math.max(0, subtotal - (descuento || 0) + (costoEnvio || 0));
  // Ganancia bruta: lo que deja la venta antes de descuentos (ingreso - costo
  // de lo vendido). Ganancia neta: lo que realmente queda después de aplicar
  // el descuento otorgado (el envío no cuenta como costo propio porque se le
  // cobra aparte al cliente).
  const gananciaBruta = subtotal - costoTotal;
  const ganancia = gananciaBruta - (descuento || 0); // neta — se mantiene el nombre "ganancia" por compatibilidad con Dashboard/Asistente IA
  const nuevaVenta = {
    _id: uid(), fecha: nowIso(), clienteId: clienteId || null, clienteInvitado: clienteInvitado || null, items: itemsFinal,
    descuento: descuento || 0, cupon: cupon || "", costoEnvio: costoEnvio || 0,
    metodoPago, estado, subtotal, total, gananciaBruta, ganancia,
    pedidoOrigenId: pedidoOrigenId || null,
  };
  await ventas.insertOne(nuevaVenta);
  for (const i of itemsFinal) {
    await crearMovimiento(movimientos, {
      perfumeId: i.perfumeId, nombrePerfume: i.nombrePerfume, tipo: "salida", cantidad: i.cantidad,
      motivo: `Venta ${i.tipo === "decant" ? "(decant " + i.cantidad + "ml)" : "(" + i.cantidad + (i.kind === "accesorio" ? " accesorio(s))" : " frasco(s))")}`,
    });
  }
  const { _id, ...rest } = nuevaVenta;
  return { ok: true, venta: { id: _id, ...rest } };
}

// Convierte un pedido de la tienda pública en una venta registrada de una
// sola vez: traduce sus items al formato del carrito de venta, descuenta
// inventario, y marca el pedido como atendido enlazándolo a la venta.
async function convertirPedidoEnVenta(pedidoId, { metodoPago, estado }) {
  const { pedidos } = await getCollections();
  const pedido = await pedidos.findOne({ _id: pedidoId });
  if (!pedido) return { error: "Ese pedido ya no existe." };
  if (pedido.ventaId) return { error: "Este pedido ya se había convertido en una venta." };

  const items = (pedido.items || []).map((it) => {
    const esDecant = it.tipo === "decant";
    const cantidadTotal = esDecant ? (it.ml || 0) * (it.cantidad || 0) : (it.cantidad || 0);
    const precioUnitario = esDecant ? (it.precioUnitario || 0) / (it.ml || 1) : (it.precioUnitario || 0);
    return {
      kind: it.kind === "accesorio" ? "accesorio" : "perfume",
      perfumeId: it.id,
      nombrePerfume: it.nombre,
      marca: "",
      tipo: it.tipo || "frasco",
      cantidad: cantidadTotal,
      precioUnitario,
      subtotal: (it.precioUnitario || 0) * (it.cantidad || 0),
    };
  });

  const resultado = await completarVenta({
    items,
    clienteId: null,
    clienteInvitado: { nombre: pedido.envio?.nombre || "", telefono: pedido.envio?.telefono || "" },
    descuento: 0,
    cupon: "",
    costoEnvio: 0,
    metodoPago: metodoPago || pedido.envio?.metodoPago || "Efectivo",
    estado: estado || "Pagado",
    pedidoOrigenId: pedidoId,
  });
  if (resultado.error) return resultado;

  await pedidos.updateOne({ _id: pedidoId }, { $set: { estado: "atendido", ventaId: resultado.venta.id } });
  return resultado;
}

/* ---------------- Pedidos web (tienda pública) ----------------
   Un pedido web es solo la intención de compra del cliente (no descuenta
   inventario todavía) — el dueño la confirma por WhatsApp y luego registra
   la venta real desde el panel cuando el pago esté confirmado. */

async function crearPedidoWeb(pedido) {
  const { pedidos } = await getCollections();
  const doc = { _id: uid(), fecha: nowIso(), estado: "pendiente", ...pedido, _creadoEn: Date.now() };
  await pedidos.insertOne(doc);
  const { _id, _creadoEn, ...rest } = doc;
  return { id: _id, ...rest };
}

async function actualizarEstadoPedidoWeb(id, estado) {
  const { pedidos } = await getCollections();
  await pedidos.updateOne({ _id: id }, { $set: { estado } });
}

async function eliminarPedidoWeb(id) {
  const { pedidos } = await getCollections();
  await pedidos.deleteOne({ _id: id });
}

/* ---------------- Respaldo / restauración / borrado total ---------------- */

async function restaurarDatos(payload) {
  const { perfumes, accesorios, clientes, ventas, movimientos } = await getCollections();
  const asArray = (v) => (Array.isArray(v) ? v : []);
  const toDoc = (item) => { const { id, ...rest } = item; return { _id: id || uid(), ...rest, _creadoEn: Date.now() }; };

  await Promise.all([
    perfumes.deleteMany({}), accesorios.deleteMany({}), clientes.deleteMany({}),
    ventas.deleteMany({}), movimientos.deleteMany({}),
  ]);
  const p = asArray(payload.perfumes).map(toDoc);
  const a = asArray(payload.accesorios).map(toDoc);
  const c = asArray(payload.clientes).map(toDoc);
  const v = asArray(payload.ventas).map(toDoc);
  const m = asArray(payload.movimientos).map(toDoc);
  if (p.length) await perfumes.insertMany(p);
  if (a.length) await accesorios.insertMany(a);
  if (c.length) await clientes.insertMany(c);
  if (v.length) await ventas.insertMany(v);
  if (m.length) await movimientos.insertMany(m);
}

async function borrarTodo() {
  const { perfumes, accesorios, clientes, ventas, movimientos } = await getCollections();
  await Promise.all([
    perfumes.deleteMany({}), accesorios.deleteMany({}), clientes.deleteMany({}),
    ventas.deleteMany({}), movimientos.deleteMany({}),
  ]);
}

export const store = {
  getAllData,
  guardarPerfume, eliminarPerfume, importarPerfumes, duplicarPerfume, ajustarInventario, abrirFrascoDecant,
  guardarCliente, eliminarCliente,
  guardarAccesorio, eliminarAccesorio,
  completarVenta, convertirPedidoEnVenta,
  crearPedidoWeb, actualizarEstadoPedidoWeb, eliminarPedidoWeb,
  restaurarDatos, borrarTodo,
  precioDecant,
};
