# JACO SCENTS — Lista de pendientes

Ordenado de menor a mayor costo/tokens, para avanzar en varias corridas.

## ✅ Hecho en esta corrida
- [x] Logo integrado en header y footer de la tienda (chip circular sobre fondo bone, funciona sobre el header oscuro).
- [x] Favicon actualizado con el ícono del logo.
- [x] Botón "Añadir decant" visible en el módulo Decants del panel admin (antes solo aparecía cuando la lista estaba vacía). Nota de diseño: un decant no es una entidad separada, nace de activar "Venta en decants" dentro de la ficha de un perfume — el botón lleva directo al catálogo.

## ✅ Hecho (segunda y tercera corrida)
- [x] Carrusel visual real en la home (`ShowcaseCarousel`, reemplazó la tira chica `FeaturedStrip`) con fotos grandes de los perfumes destacados.
- [x] Silueta decorativa de frasco en dorado detrás del texto del hero, para dar personalidad sin depender de fotos.
- [x] Formulario de "Nuevo perfume" reducido a 5 campos esenciales visibles (Nombre, Marca, Precio de venta, Cantidad disponible, Foto). El resto (SKU, código de barras, proveedor, precio de compra, género, tipo, decants, notas, etc.) sigue existiendo pero detrás de un botón "Más detalles (opcional)". No se perdió ningún campo del modelo de datos.

## ✅ Hecho (cuarta corrida)
- [x] Corrección de contraste en vistas públicas: texto "Desliza para ver más" en la home, aviso "Sin mililitros disponibles" y tamaños agotados en Decants, y "No disponible" en tarjetas de producto — todos eran texto claro sobre fondo claro, ahora usan un gris más oscuro y legible. Se revisó también el header/footer/hero (fondo oscuro) y ahí el contraste ya era correcto, no se tocó.

## ✅ Hecho (quinta corrida)
- [x] Filtro de catálogo público: nuevo componente `ProductFilters` (marca dinámica según lo que tengas cargado, tipo EDT/EDP/etc., y temporada como aproximación de "ocasión de uso"). Conectado en Perfumes y en Decants (se suma al filtro de género que ya existía ahí). Nota: no existe un campo dedicado de "ocasión de uso" en el modelo de datos — usé Temporada como el más cercano. Si quieres un campo real de "ocasión" (ej. Diario/Noche/Oficina/Cita/Formal), se puede agregar como opcional en "Más detalles" del formulario y sumarlo al filtro sin tocar el resto.

## 🔜 Siguiente corrida (bajo costo)
- [ ] Revisar contraste de textos claros sobre fondos claros en vistas públicas puntuales que quedaron pendientes de auditar fuera de la home (Perfumes/Decants/Accesorios/Búsqueda).

## 🟡 Costo medio
- [ ] Carrusel de imágenes en la home (destacados/novedades) con swipe/autoplay.
- [ ] Sección de "referencias visuales" en home con imágenes reales de perfumes (requiere que subas fotos o las tomes del catálogo ya cargado).

## ✅ Hecho (sexta corrida)
- [x] Módulo de importación de catálogo desde Excel/CSV: botón "Importar Excel" en Catálogo → sube el archivo, detecta solas las columnas de Nombre, Marca, Precio, Cantidad e Imagen (aunque tu hoja no use exactamente esos nombres de encabezado), muestra una vista previa, y da de alta todo de un clic. Se agregó la librería `xlsx` (SheetJS) al proyecto — necesitas correr `npm install` una vez antes de `npm run dev` / build.

## ✅ Hecho (novena corrida — corrección de bug real)
- [x] **Bug de raíz encontrado y corregido**: la utilidad `bg-ink-gradient` de Tailwind nunca se compilaba al CSS final (confirmado con una build limpia: 0 apariciones en el CSS de salida). Por eso el hero y el banner del recomendador se veían con fondo claro y texto blanco casi invisible. Se reemplazó por un `style` en línea con el mismo gradiente — ya no depende de que Tailwind lo genere, así que no puede volver a fallar de esta forma.
- [x] Tarjetas del carrusel de la home: ahora rotan entre 4 degradados distintos y muestran la inicial del perfume en grande cuando no hay foto, en vez de repetir siempre el mismo ícono de gota — se ve menos repetitivo mientras no subas fotos reales.
- [x] Aclaración: el carrusel de destacados nunca fue pensado como fondo detrás del texto del hero — va como tira debajo, superpuesta al borde inferior (patrón común en tiendas online). Si quieres literalmente fotos rotando como fondo del hero, es una función distinta y más grande — dime si la quieres.

## Pendiente de tu decisión
- ¿El botón "Añadir decant" debe abrir directamente el modal de edición del perfume (requiere elegir cuál), o basta con llevar al catálogo como quedó ahora?

## ✅ Hecho (séptima corrida)
- [x] **Calificaciones**: campo de estrellas (1-5, opcional) que tú asignas a cada perfume desde "Más detalles" del formulario. Se muestra en Perfumes, Decants y Búsqueda. Nota técnica: como todo se guarda en el navegador (sin base de datos), no es posible tener reseñas escritas por clientes reales visibles para todos — por eso quedó como calificación curada por ti.
- [x] **Recomendador**: página nueva en "Para ti" del menú — 3 preguntas (para quién / temporada / intensidad) que puntúan y filtran tu catálogo real. Banner de entrada en la home.
- [x] **Orden de compra / carrito público**: botón de carrito (bolsa) en el header con contador, botón "+" para agregar productos desde Perfumes/Accesorios/Búsqueda, y tamaños de decant agregables individualmente. El checkout pide nombre, teléfono, dirección, ciudad, método de pago y notas; arma un resumen y abre WhatsApp con todo listo para confirmar. El pedido también se guarda como **"Pedido web"** — pestaña nueva "Pedidos" en el panel admin, con badge de pendientes. Importante: un pedido web **no descuenta inventario ni crea una venta real** — es la intención de compra; cuando confirmes el pago, tú registras la venta de verdad desde Ventas como siempre.
- [x] Verificado con `npm install` + `npx vite build` real dentro del entorno — compila sin errores.

## 🟡 Pendiente / ideas no construidas todavía
- Sección de imágenes de referencia reales (necesita que subas fotos, no puedo inventarlas).
- Campo real de "ocasión de uso" (Diario/Noche/Oficina/Cita/Formal) si lo quieres más preciso que Temporada.
- Página "Sobre nosotros", envíos/garantías, alertas de reabastecimiento, recordatorio de cumpleaños de clientes.

## ✅ Hecho (octava corrida)
- [x] Botón flotante de WhatsApp fijo en toda la tienda pública (esquina inferior derecha).
- [x] Meta tags Open Graph / Twitter Card para que al compartir el link se vea bien — ya estaban en `index.html` junto con `public/og-image.jpg`, no fue necesario tocarlos.
- [x] Carrusel de la home con autoplay (se pausa al pasar el mouse o tocar en móvil).
- [x] Exportar reporte de ventas a Excel — botón nuevo en Ventas → Historial de ventas, descarga un `.xlsx` con fecha, cliente, productos, método de pago, estado y totales.
- [x] Verificado con `npm install` + `npx vite build` real — compila sin errores.
