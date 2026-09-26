import React from "react";
import { FileText } from "lucide-react";

export default function AvisoPrivacidadView({ onNavigate }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-700 mb-2 flex items-center justify-center gap-2">
          <FileText size={14} /> Legal
        </p>
        <h1 className="jaco-serif text-4xl font-semibold text-ink">Términos y condiciones</h1>
        <p className="text-sm text-neutral-500 mt-2">Última actualización: {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div className="space-y-7 text-sm text-neutral-700 leading-relaxed">
        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">1. Aceptación de estos términos</h2>
          <p>Al navegar este sitio, armar un pedido o contactarnos por WhatsApp para comprar, aceptas los términos descritos aquí. Si no estás de acuerdo con alguno, te pedimos no continuar con tu compra.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">2. Sobre nuestros productos</h2>
          <p className="mb-2">Vendemos dos tipos de producto:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Frascos completos:</strong> perfumes 100% originales y sellados por su fabricante.</li>
            <li><strong>Decants:</strong> una porción del perfume original, reenvasada por nosotros en un frasco más pequeño. El contenido proviene de un frasco original de la marca, pero el envase final del decant no es un producto oficial de la casa perfumera — es un reenvasado hecho por nosotros para que puedas comprar solo la cantidad que quieras probar.</li>
          </ul>
          <p className="mt-2">Los nombres de marcas y casas perfumeras mencionados en este sitio son propiedad de sus respectivos dueños. Los usamos únicamente para identificar el perfume que vendemos y no implican ninguna afiliación, patrocinio o aprobación por parte de esas marcas hacia nuestro negocio.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">3. Precios y disponibilidad</h2>
          <p>Los precios mostrados están sujetos a cambio sin previo aviso y pueden contener errores involuntarios de captura. Si detectamos un error de precio antes de confirmar tu pedido, te avisaremos y podrás decidir si continúas con el precio correcto o cancelas sin costo. La disponibilidad de cada producto puede cambiar entre el momento en que navegas el catálogo y el momento en que confirmamos tu pedido.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">4. Cómo se procesa un pedido</h2>
          <p>Armar un carrito y enviar tus datos en este sitio <strong>no es una compra confirmada</strong> — es una solicitud de pedido. Después de enviarlo, te contactaremos por WhatsApp para confirmar disponibilidad, forma de pago y, si aplica, los detalles de envío. La compra se considera confirmada hasta que ambas partes lo acuerden por ese medio.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">5. Envíos y entrega en persona</h2>
          <p>Si eliges envío a domicilio, es tu responsabilidad proporcionar una dirección completa y correcta; no nos hacemos responsables por retrasos o pérdidas causadas por datos de envío incompletos o equivocados. Si eliges recoger tu pedido en persona, coordinaremos contigo el lugar y horario por WhatsApp.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">6. Cambios y devoluciones</h2>
          <p>Por tratarse de productos de higiene personal, los decants no tienen devolución una vez entregados, salvo que el producto presente un defecto directamente atribuible a nosotros (por ejemplo, un envase dañado o un error en el producto enviado). En frascos completos sellados, aceptamos cambios únicamente si el sello de fábrica está intacto y nos contactas dentro de las 24 horas siguientes a la entrega. Cada caso se revisa de forma individual por WhatsApp.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">7. Limitación de responsabilidad</h2>
          <p>Hacemos nuestro mejor esfuerzo por describir cada producto con precisión (notas, concentración, presentación), pero la percepción de una fragancia puede variar de persona a persona por razones de química corporal, y no garantizamos que un perfume se perciba igual en ti que en otra persona. En la medida permitida por la ley aplicable, no somos responsables por daños indirectos derivados del uso del producto; recomendamos siempre hacer una prueba de sensibilidad en la piel antes del primer uso completo.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">8. Uso del sitio</h2>
          <p>Este sitio es solo para consulta de catálogo y armado de pedidos. No está permitido usarlo para fines fraudulentos, para intentar acceder sin autorización a áreas administrativas, o para interferir con su funcionamiento normal.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">9. Cambios a estos términos</h2>
          <p>Podemos actualizar estos términos en cualquier momento; la fecha de "última actualización" arriba refleja la versión vigente. El uso continuado del sitio después de un cambio implica tu aceptación de la nueva versión.</p>
        </section>

        <section>
          <h2 className="jaco-serif text-xl font-semibold text-ink mb-2">10. Contacto</h2>
          <p>Para dudas sobre estos términos, puedes escribirnos por WhatsApp desde el botón flotante de este sitio.</p>
        </section>

        <p className="text-xs text-neutral-400 pt-4 border-t border-bone-200">
          Consulta también nuestro{" "}
          <button onClick={() => onNavigate?.("privacidad")} className="underline hover:text-neutral-600">Aviso de privacidad</button>.
        </p>
      </div>
    </div>
  );
}
