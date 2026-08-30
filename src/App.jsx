import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useJacoData } from "./hooks/useJacoData";
import { useInactivityLogout } from "./hooks/useInactivityLogout";
import { getToken } from "./apiClient";
import Tienda from "./Tienda";
import AdminPanel from "./AdminPanel";
import AdminGateModal from "./store/AdminGateModal";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos

export default function App() {
  const data = useJacoData();
  const [view, setView] = useState("tienda"); // "tienda" | "admin"
  const [gateOpen, setGateOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);

  // "volver a la tienda" = solo cambia de vista, la sesión sigue activa
  // (puedes regresar al panel sin volver a escribir la contraseña). Cerrar
  // sesión de verdad, o que se cierre por inactividad, sí borra el token.
  const exitAdmin = (reason) => {
    setView("tienda");
    if (reason === "inactivity" || reason === "logout") {
      data.cerrarSesionAdmin();
      if (reason === "inactivity") data.showToast("Sesión de administrador cerrada por inactividad", "error");
    }
  };

  // Si este dispositivo ya tiene una sesión guardada (inició sesión antes,
  // en los últimos 30 días), entra directo sin volver a pedir contraseña.
  // Si no, o si esa sesión ya expiró, muestra el candado como siempre.
  const requestAdmin = async () => {
    if (getToken()) {
      setCheckingSession(true);
      const ok = await data.cargarDatosAdmin();
      setCheckingSession(false);
      if (ok) { setView("admin"); return; }
    }
    setGateOpen(true);
  };

  const onGateSuccess = async () => {
    const ok = await data.cargarDatosAdmin();
    setGateOpen(false);
    if (ok) setView("admin");
  };

  useInactivityLogout(view === "admin", INACTIVITY_TIMEOUT_MS, () => exitAdmin("inactivity"));

  if (data.loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <p className="jaco-display text-3xl font-semibold tracking-[0.2em] mb-3 text-white">
            JACO<span className="text-gold-400">SCENTS</span>
          </p>
          <Loader2 className="animate-spin mx-auto text-gold-400" size={20} />
        </div>
      </div>
    );
  }

  if (view === "admin" && data.adminReady) {
    return <AdminPanel data={data} onExit={() => exitAdmin("manual")} onLogout={() => exitAdmin("logout")} />;
  }

  return (
    <>
      <Tienda perfumes={data.perfumes} accesorios={data.accesorios} onRequestAdmin={requestAdmin} crearPedidoWeb={data.crearPedidoWeb} />
      {checkingSession && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
          <Loader2 className="animate-spin text-white" size={28} />
        </div>
      )}
      <AdminGateModal open={gateOpen} onClose={() => setGateOpen(false)} onSuccess={onGateSuccess} />
    </>
  );
}
