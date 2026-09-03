import React, { useState } from "react";
import { LayoutDashboard, Package, Droplet, ShoppingCart, Users, Sparkles, Gem, Settings, ArrowLeft, ShoppingBag, RefreshCw, LogOut } from "lucide-react";
import { cx } from "./utils";

import DashboardTab from "./components/tabs/DashboardTab";
import CatalogoTab from "./components/tabs/CatalogoTab";
import DecantsTab from "./components/tabs/DecantsTab";
import VentasTab from "./components/tabs/VentasTab";
import PedidosTab from "./components/tabs/PedidosTab";
import ClientesTab from "./components/tabs/ClientesTab";
import AccesoriosTab from "./components/tabs/AccesoriosTab";
import AsistenteTab from "./components/tabs/AsistenteTab";
import AjustesTab from "./components/tabs/AjustesTab";

import { PerfumeFormModal, ClienteFormModal, AjusteInventarioModal, AbrirDecantModal, TicketModal, AccesorioFormModal } from "./components/modals";
import ImportarExcelModal from "./components/ImportarExcelModal";
import { ToastView, ConfirmDialog } from "./components/UI";

const TABS = [
  { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
  { id: "catalogo", label: "Catálogo", icon: Package },
  { id: "decants", label: "Decants", icon: Droplet },
  { id: "accesorios", label: "Accesorios", icon: Gem },
  { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
  { id: "ventas", label: "Ventas", icon: ShoppingCart },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "asistente", label: "Asistente IA", icon: Sparkles },
  { id: "ajustes", label: "Ajustes", icon: Settings },
];

// Panel de administración. Recibe todos los datos y operaciones desde
// useJacoData() (llamado una sola vez arriba, en App.jsx) para que la tienda
// pública y el admin siempre compartan la misma fuente de verdad.
export default function AdminPanel({ data, onExit, onLogout }) {
  const {
    perfumes, clientes, ventas, movimientos, accesorios, carrito, pedidosWeb, toast, loadingAdmin, cargarDatosAdmin,
    guardarPerfume, eliminarPerfume, importarPerfumes, duplicarPerfume, ajustarInventario, abrirFrascoDecant,
    guardarCliente, eliminarCliente,
    guardarAccesorio, eliminarAccesorio,
    exportarDatos, restaurarDatos, borrarTodo,
    addToCartFrasco, addToCartDecant, updateCartQty, removeFromCart, completarVenta,
    actualizarEstadoPedidoWeb, eliminarPedidoWeb,
  } = data;

  const [activeTab, setActiveTab] = useState("dashboard");
  const [perfumeModal, setPerfumeModal] = useState(null);
  const [importModal, setImportModal] = useState(false);
  const [clienteModal, setClienteModal] = useState(null);
  const [accesorioModal, setAccesorioModal] = useState(null);
  const [ajusteModal, setAjusteModal] = useState(null);
  const [abrirModal, setAbrirModal] = useState(null);
  const [ticketModal, setTicketModal] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const onGuardarPerfume = async (formData) => {
    const ok = await guardarPerfume(formData, perfumeModal?.mode === "edit" ? perfumeModal.perfume.id : null);
    if (ok) setPerfumeModal(null);
  };
  const onGuardarCliente = async (formData) => {
    const ok = await guardarCliente(formData, clienteModal?.mode === "edit" ? clienteModal.cliente.id : null);
    if (ok) setClienteModal(null);
  };
  const onGuardarAccesorio = async (formData) => {
    const ok = await guardarAccesorio(formData, accesorioModal?.mode === "edit" ? accesorioModal.accesorio.id : null);
    if (ok) setAccesorioModal(null);
  };
  const onAjustarInventario = async (...args) => {
    const ok = await ajustarInventario(...args);
    if (ok) setAjusteModal(null);
  };
  const onAbrirDecant = async (...args) => {
    const ok = await abrirFrascoDecant(...args);
    if (ok) setAbrirModal(null);
  };
  const onCompletarVenta = async (payload) => {
    const v = await completarVenta(payload);
    if (v) setTicketModal(v);
  };

  const pedirEliminarPerfume = (perfume) => {
    setConfirmDialog({
      title: "Eliminar perfume",
      message: `¿Seguro que quieres eliminar "${perfume.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => { await eliminarPerfume(perfume.id); setConfirmDialog(null); },
    });
  };
  const pedirEliminarCliente = (cliente) => {
    setConfirmDialog({
      title: "Eliminar cliente",
      message: `¿Seguro que quieres eliminar a "${cliente.nombre}"?`,
      onConfirm: async () => { await eliminarCliente(cliente.id); setConfirmDialog(null); },
    });
  };
  const pedirEliminarAccesorio = (accesorio) => {
    setConfirmDialog({
      title: "Eliminar accesorio",
      message: `¿Seguro que quieres eliminar "${accesorio.nombre}"?`,
      onConfirm: async () => { await eliminarAccesorio(accesorio.id); setConfirmDialog(null); },
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-neutral-900">
      <ToastView toast={toast} />

      <header className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onExit} title="Volver a la tienda" aria-label="Volver a la tienda" className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-300">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="jaco-display text-xl font-semibold tracking-[0.15em]">JACO SCENTS</h1>
              <p className="text-[10px] text-neutral-400 tracking-wide uppercase">Panel de administración</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => cargarDatosAdmin()}
              disabled={loadingAdmin}
              title="Traer los datos más recientes (por si llegó un pedido u otro cambio desde otro dispositivo)"
              aria-label="Refrescar datos"
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-300 disabled:opacity-50"
            >
              <RefreshCw size={15} className={loadingAdmin ? "animate-spin" : ""} />
            </button>
            <button onClick={onLogout} title="Cerrar sesión" aria-label="Cerrar sesión" className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-300">
              <LogOut size={15} />
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-2 flex gap-1 overflow-x-auto border-t border-neutral-800">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={cx("flex items-center gap-1.5 px-3.5 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors", activeTab === t.id ? "border-red-600 text-white" : "border-transparent text-neutral-400 hover:text-neutral-200")}>
              <t.icon size={14} />{t.label}
              {t.id === "ventas" && carrito.length > 0 ? <span className="ml-0.5 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{carrito.length}</span> : null}
              {t.id === "pedidos" && pedidosWeb.filter((p) => p.estado === "pendiente").length > 0 ? <span className="ml-0.5 bg-gold-400 text-ink text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{pedidosWeb.filter((p) => p.estado === "pendiente").length}</span> : null}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5">
        {activeTab === "dashboard" && <DashboardTab perfumes={perfumes} clientes={clientes} ventas={ventas} onGoTo={setActiveTab} />}
        {activeTab === "catalogo" && <CatalogoTab perfumes={perfumes} onAdd={() => setPerfumeModal({ mode: "add" })} onEdit={(p) => setPerfumeModal({ mode: "edit", perfume: p })} onDelete={pedirEliminarPerfume} onDuplicate={duplicarPerfume} onAjustar={(p) => setAjusteModal(p)} onAddCart={addToCartFrasco} onImport={() => setImportModal(true)} />}
        {activeTab === "decants" && <DecantsTab perfumes={perfumes} onAbrir={(p) => setAbrirModal(p)} onVender={addToCartDecant} onGoTo={setActiveTab} />}
        {activeTab === "accesorios" && <AccesoriosTab accesorios={accesorios} onAdd={() => setAccesorioModal({ mode: "add" })} onEdit={(a) => setAccesorioModal({ mode: "edit", accesorio: a })} onDelete={pedirEliminarAccesorio} />}
        {activeTab === "pedidos" && <PedidosTab pedidosWeb={pedidosWeb} onMarcarAtendido={(id) => actualizarEstadoPedidoWeb(id, "atendido")} onEliminar={eliminarPedidoWeb} />}
        {activeTab === "ventas" && <VentasTab carrito={carrito} clientes={clientes} onUpdateQty={updateCartQty} onRemove={removeFromCart} onCompletar={onCompletarVenta} ventas={ventas} onVerTicket={setTicketModal} />}
        {activeTab === "clientes" && <ClientesTab clientes={clientes} ventas={ventas} onAdd={() => setClienteModal({ mode: "add" })} onEdit={(c) => setClienteModal({ mode: "edit", cliente: c })} onDelete={pedirEliminarCliente} />}
        {activeTab === "asistente" && <AsistenteTab perfumes={perfumes} clientes={clientes} ventas={ventas} />}
        {activeTab === "ajustes" && (
          <AjustesTab
            perfumes={perfumes} clientes={clientes} ventas={ventas} movimientos={movimientos} accesorios={accesorios}
            onExportar={exportarDatos} onImportar={restaurarDatos} onBorrarTodo={borrarTodo}
          />
        )}
      </main>

      <PerfumeFormModal open={!!perfumeModal} onClose={() => setPerfumeModal(null)} onSave={onGuardarPerfume} initial={perfumeModal?.mode === "edit" ? perfumeModal.perfume : null} />
      <ImportarExcelModal open={importModal} onClose={() => setImportModal(false)} onImport={importarPerfumes} />
      <ClienteFormModal open={!!clienteModal} onClose={() => setClienteModal(null)} onSave={onGuardarCliente} initial={clienteModal?.mode === "edit" ? clienteModal.cliente : null} />
      <AccesorioFormModal open={!!accesorioModal} onClose={() => setAccesorioModal(null)} onSave={onGuardarAccesorio} initial={accesorioModal?.mode === "edit" ? accesorioModal.accesorio : null} />
      <AjusteInventarioModal open={!!ajusteModal} onClose={() => setAjusteModal(null)} perfume={ajusteModal} onSave={onAjustarInventario} />
      <AbrirDecantModal open={!!abrirModal} onClose={() => setAbrirModal(null)} perfume={abrirModal} onSave={onAbrirDecant} />
      <TicketModal open={!!ticketModal} onClose={() => setTicketModal(null)} venta={ticketModal} cliente={clientes.find((c) => c.id === ticketModal?.clienteId)} />
      <ConfirmDialog open={!!confirmDialog} title={confirmDialog?.title} message={confirmDialog?.message} onConfirm={confirmDialog?.onConfirm} onCancel={() => setConfirmDialog(null)} />
    </div>
  );
}
