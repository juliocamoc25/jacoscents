import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

// Cierra la sesión de administrador automáticamente tras un período sin
// actividad (mitiga el riesgo de dejar el panel abierto y desatendido en una
// computadora compartida o de mostrador).
export function useInactivityLogout(active, timeoutMs, onTimeout) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onTimeout, timeoutMs);
    };

    reset();
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, reset));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, timeoutMs]);
}
