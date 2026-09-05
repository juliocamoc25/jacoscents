import { useEffect, useState, useCallback } from "react";
import { uid, precioDecant } from "../utils";
import {
  getToken, logout as apiLogout,
  fetchPublicCatalog, crearPedidoPublico,
  fetchAdminData, runAdminAction,
} from "../apiClient";

// Hook central: la tienda pública lee el catálogo público (sin costos ni
// datos internos) apenas se abre la página. El panel de administración,
// al entrar con la contraseña correcta, carga el set completo de datos
// desde el servidor (MongoDB Atlas) — así el inventario, las ventas y los
// pedidos son siempre los mismos sin importar desde qué dispositivo entres.
export function useJacoData() {
  const [perfumes, setPerfumes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [pedidosWeb, setPedidosWeb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminReady, setAdminReady] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  // Catálogo público — se carga siempre, para cualquier visitante.
  useEffect(() => {
    fetchPublicCatalog()
      .then((data) => { setPerfumes(data.perfumes || []); setAccesorios(data.accesorios || []); })
      .catch(() => showToast("No se pudo cargar el catálogo. Revisa tu conexión.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const aplicarDataset = (data) => {
    setPerfumes(data.perfumes || []);
    setAccesorios(data.accesorios || []);
    setClientes(data.clientes || []);
    setVentas(data.ventas || []);
    setMovimientos(data.movimientos || []);
    setPedidosWeb(data.pedidosWeb || []);
  };

  // Se llama al entrar al panel (con contraseña, o con la sesión ya
  // recordada en este dispositivo). Regresa false si la sesión no es
  // válida, para que quien la llame vuelva a pedir la contraseña.
  const cargarDatosAdmin = useCallback(async () => {
    setLoadingAdmin(true);
    try {
      const data = await fetchAdminData();
      aplicarDataset(data);
      setAdminReady(true);
      return true;
    } catch (err) {
      setAdminReady(false);
      return false;
    } finally {
      setLoadingAdmin(false);
    }
  }, []);

  const cerrarSesionAdmin = useCallback(() => {
    apiLogout();
    setAdminReady(false);
    setCarrito([]);
    fetchPublicCatalog().then((data) => { setPerfumes(data.perfumes || []); setAccesorios(data.accesorios || []); }).catch(() => {});
  }, []);

  // Ejecuta una acción de escritura contra /api/admin. Actualiza todo el
  // estado con la respuesta del servidor (siempre manda el set completo y
  // ya actualizado) y maneja el caso de sesión expirada.
  const accion = async (action, payload, mensajeExito, onSessionExpired) => {
    try {
      const data = await runAdminAction(action, payload);
      aplicarDataset(data);
      if (mensajeExito) showToast(mensajeExito);
      return data;
    } catch (err) {
      if (err.message === "SESSION_EXPIRED") {
        setAdminReady(false);
        showToast("Tu sesión expiró, inicia sesión de nuevo", "error");
        onSessionExpired?.();
      } else {
        showToast(err.message || "No se pudo guardar. Intenta de nuevo.", "error");
      }
      return null;
    }
  };

  /* ---- Perfumes ---- */
  const guardarPerfume = (data, editingId) =>
    accion("guardar-perfume", { data, editingId }, editingId ? "Perfume actualizado" : "Perfume agregado");

  const eliminarPerfume = (id) => accion("eliminar-perfume", { id }, "Perfume eliminado");

  const importarPerfumes = (lista) =>
    accion("importar-perfumes", { lista }, `${lista.length} perfume${lista.length === 1 ? "" : "s"} importado${lista.length === 1 ? "" : "s"}`);

  const duplicarPerfume = (perfume) => accion("duplicar-perfume", { id: perfume.id }, "Perfume duplicado");

  const ajustarInventario = (perfumeId, tipo, cantidad, motivo, precioCompraNuevo) =>
    accion("ajustar-inventario", { perfumeId, tipo, cantidad, motivo, precioCompraNuevo }, "Movimiento registrado");

  const abrirFrascoDecant = (perfumeId, ml) =>
    accion("abrir-decant", { perfumeId, ml }, "Frasco abierto para decants");

  /* ---- Clientes ---- */
  const guardarCliente = (data, editingId) =>
    accion("guardar-cliente", { data, editingId }, editingId ? "Cliente actualizado" : "Cliente agregado");
  const eliminarCliente = (id) => accion("eliminar-cliente", { id }, "Cliente eliminado");

  /* ---- Accesorios ---- */
  const guardarAccesorio = (data, editingId) =>
    accion("guardar-accesorio", { data, editingId }, editingId ? "Accesorio actualizado" : "Accesorio agregado");
  const eliminarAccesorio = (id) => accion("eliminar-accesorio", { id }, "Accesorio eliminado");

  /* ---- Respaldo / restauración / borrado total ---- */
  const exportarDatos = () => ({
    exportadoEn: new Date().toISOString(),
    negocio: "JACO SCENTS",
    perfumes, clientes, ventas, movimientos, accesorios,
  });

  const restaurarDatos = async (payload) => {
    if (!payload || typeof payload !== "object") { showToast("El archivo de respaldo no es válido", "error"); return false; }
    const r = await accion("restaurar-datos", payload, "Respaldo restaurado con éxito");
    return !!r;
  };

  const borrarTodo = () => accion("borrar-todo", {}, "Todos los datos fueron eliminados");

  /* ---- Carrito / Ventas (uso interno del admin, tipo punto de venta) ---- */
  const addToCartFrasco = (perfume) => {
    const enCarrito = carrito.filter((i) => i.perfumeId === perfume.id && i.tipo === "frasco").reduce((s, i) => s + i.cantidad, 0);
    if (perfume.cantidadDisponible - enCarrito < 1) { showToast("Sin stock disponible", "error"); return; }
    setCarrito((prev) => [...prev, { id: uid(), kind: "perfume", perfumeId: perfume.id, nombrePerfume: perfume.nombre, marca: perfume.marca, tipo: "frasco", cantidad: 1, precioUnitario: perfume.precioVenta, subtotal: perfume.precioVenta }]);
    showToast(`${perfume.nombre} agregado a la venta`);
  };

  const addToCartDecant = (perfume, ml) => {
    const mlEnCarrito = carrito.filter((i) => i.perfumeId === perfume.id && i.tipo === "decant").reduce((s, i) => s + i.cantidad, 0);
    if ((perfume.decant.mlDisponible || 0) - mlEnCarrito < ml) { showToast("No hay suficiente ml disponible", "error"); return; }
    const precio = precioDecant(perfume.decant, ml);
    setCarrito((prev) => [...prev, { id: uid(), kind: "perfume", perfumeId: perfume.id, nombrePerfume: perfume.nombre, marca: perfume.marca, tipo: "decant", cantidad: ml, precioUnitario: precio / ml, subtotal: precio }]);
    showToast(`Decant de ${ml}ml agregado a la venta`);
  };

  const addToCartAccesorio = (accesorio) => {
    const enCarrito = carrito.filter((i) => i.perfumeId === accesorio.id && i.kind === "accesorio").reduce((s, i) => s + i.cantidad, 0);
    if (accesorio.cantidadDisponible - enCarrito < 1) { showToast("Sin stock disponible", "error"); return; }
    setCarrito((prev) => [...prev, { id: uid(), kind: "accesorio", perfumeId: accesorio.id, nombrePerfume: accesorio.nombre, marca: "", tipo: "frasco", cantidad: 1, precioUnitario: accesorio.precio, subtotal: accesorio.precio }]);
    showToast(`${accesorio.nombre} agregado a la venta`);
  };

  const updateCartQty = (index, delta) => {
    setCarrito((prev) => {
      const item = prev[index];
      if (!item || item.tipo !== "frasco") return prev;
      const stockDisponible = item.kind === "accesorio"
        ? accesorios.find((a) => a.id === item.perfumeId)?.cantidadDisponible
        : perfumes.find((p) => p.id === item.perfumeId)?.cantidadDisponible;
      const otherQty = prev.filter((it, i) => i !== index && it.perfumeId === item.perfumeId && it.tipo === "frasco" && it.kind === item.kind).reduce((s, it) => s + it.cantidad, 0);
      const nuevaCant = Math.max(1, item.cantidad + delta);
      if (stockDisponible != null && (otherQty + nuevaCant) > stockDisponible) { showToast("Stock insuficiente", "error"); return prev; }
      const nuevos = [...prev];
      nuevos[index] = { ...item, cantidad: nuevaCant, subtotal: item.precioUnitario * nuevaCant };
      return nuevos;
    });
  };

  const removeFromCart = (index) => setCarrito((prev) => prev.filter((_, i) => i !== index));

  const completarVenta = async ({ clienteId, clienteInvitado, itemsManuales, descuento, cupon, costoEnvio, metodoPago, estado }) => {
    const items = [...carrito, ...(itemsManuales || [])];
    if (items.length === 0) return null;
    const data = await accion(
      "completar-venta",
      { items, clienteId, clienteInvitado, descuento, cupon, costoEnvio, metodoPago, estado },
      "Venta registrada con éxito"
    );
    if (!data) return null;
    setCarrito([]);
    return data.ventaCompletada;
  };

  // ---- Pedidos web (tienda pública) ----
  // No requiere sesión de administrador: cualquier visitante puede armar su
  // carrito y enviarlo. No descuenta inventario todavía — solo registra la
  // intención de compra para que la confirmes por WhatsApp.
  const crearPedidoWeb = async (pedido) => {
    try {
      return await crearPedidoPublico(pedido);
    } catch (err) {
      showToast(err.message || "No se pudo enviar tu pedido. Intenta de nuevo.", "error");
      return null;
    }
  };

  const actualizarEstadoPedidoWeb = (id, estado) => accion("actualizar-estado-pedido", { id, estado });
  const eliminarPedidoWeb = (id) => accion("eliminar-pedido", { id });

  // Convierte un pedido de la tienda pública directamente en una venta
  // registrada (con su descuento en inventario correspondiente), sin tener
  // que volver a armar el carrito a mano. El pedido queda marcado como
  // "atendido" y enlazado a la venta resultante.
  const convertirPedidoEnVenta = async (pedido, { metodoPago, estado } = {}) => {
    const data = await accion(
      "convertir-pedido-en-venta",
      { pedidoId: pedido.id, metodoPago: metodoPago || pedido.envio?.metodoPago, estado: estado || "Pagado" },
      "Pedido convertido en venta"
    );
    return data?.ventaCompletada || null;
  };

  return {
    perfumes, clientes, ventas, movimientos, accesorios, carrito, pedidosWeb, loading, toast,
    adminReady, loadingAdmin, cargarDatosAdmin, cerrarSesionAdmin,
    guardarPerfume, eliminarPerfume, importarPerfumes, duplicarPerfume, ajustarInventario, abrirFrascoDecant,
    guardarCliente, eliminarCliente,
    guardarAccesorio, eliminarAccesorio,
    exportarDatos, restaurarDatos, borrarTodo,
    addToCartFrasco, addToCartDecant, addToCartAccesorio, updateCartQty, removeFromCart, completarVenta,
    crearPedidoWeb, actualizarEstadoPedidoWeb, eliminarPedidoWeb, convertirPedidoEnVenta,
    showToast,
  };
}
