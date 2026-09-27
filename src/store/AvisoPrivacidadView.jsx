import React from "react";
import { ShieldCheck } from "lucide-react";
import { WHATSAPP_NUMBER } from "../constants";
import { whatsappLink } from "../utils";

export default function AvisoPrivacidadView({ onNavigate }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-2 flex items-center justify-center gap-2">
          <ShieldCheck size={14} /> Legal
        </p>
        <h1 className="jaco-serif text-4xl font-semibold text-ink">Aviso de privacidad</h1>
        <p className="text-sm text-neutral-500 mt-2">Última actualización: {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div className="space-y-7 text-sm text-neutral-700 leading-relaxed">
        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">1. Responsable de tus datos</h2>
          <p>JACO SCENTS, negocio a través del cual operas tus compras en este sitio, es responsable del tratamiento de tus datos personales conforme a este aviso. Puedes contactarnos por WhatsApp desde el botón flotante de este sitio para cualquier duda relacionada con tus datos.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">2. Qué datos recabamos</h2>
          <p className="mb-2">Cuando armas un pedido en este sitio, recabamos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nombre completo</li>
            <li>Teléfono</li>
            <li>Dirección de envío, colonia, ciudad y código postal (solo si eliges envío a domicilio; si eliges recoger en persona, no se solicita esta información)</li>
            <li>Método de pago elegido</li>
            <li>Cualquier nota adicional que decidas escribirnos</li>
          </ul>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">3. Para qué usamos tus datos</h2>
          <p className="mb-2">Usamos tus datos únicamente para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Confirmar y procesar tu pedido</li>
            <li>Contactarte por WhatsApp sobre tu compra (confirmación, pago, envío o entrega)</li>
            <li>Coordinar el envío o la entrega en persona de tu pedido</li>
            <li>Llevar un registro interno de clientes para poder atenderte mejor en futuras compras</li>
          </ul>
          <p className="mt-2">No usamos tus datos con fines de mercadotecnia masiva ni los vendemos ni rentamos a nadie.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">4. Con quién compartimos tus datos</h2>
          <p>No compartimos tus datos personales con terceros, salvo que sea estrictamente necesario para completar tu pedido (por ejemplo, una paquetería, únicamente si tú elegiste envío a domicilio) o que la ley nos obligue a hacerlo.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">5. Cómo protegemos tus datos</h2>
          <p>Tus datos se almacenan en una base de datos con acceso restringido únicamente a quienes administran el negocio. El sitio usa conexión segura (HTTPS) y el panel de administración requiere autenticación para poder ver o modificar cualquier información.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">6. Tus derechos (ARCO)</h2>
          <p>Tienes derecho a Acceder a tus datos personales, Rectificarlos si están desactualizados o son incorrectos, Cancelar su uso, u Oponerte al tratamiento de los mismos para fines específicos. Para ejercer cualquiera de estos derechos, escríbenos por WhatsApp indicando tu nombre y teléfono con los que hiciste tu pedido, y con gusto te atendemos.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">7. Conservación de tus datos</h2>
          <p>Conservamos tu información mientras mantengas una relación comercial con nosotros o mientras sea necesario para cumplir con obligaciones legales o fiscales. Puedes solicitar la cancelación de tus datos en cualquier momento conforme al punto anterior.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">8. Cambios a este aviso</h2>
          <p>Podemos actualizar este aviso de privacidad en cualquier momento; la fecha de "última actualización" arriba refleja la versión vigente. Te recomendamos revisarlo periódicamente.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">9. Consentimiento</h2>
          <p>Al enviarnos un pedido a través de este sitio, aceptas el tratamiento de tus datos personales conforme a lo descrito en este aviso.</p>
        </section>

        <p className="text-xs text-neutral-400 pt-4 border-t border-bone-200">
          Consulta también nuestros{" "}
          <button onClick={() => onNavigate?.("terminos")} className="underline hover:text-neutral-600">Términos y condiciones</button>.
        </p>
      </div>
    </div>
  );
}
