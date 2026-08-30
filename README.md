# JACO SCENTS — Tienda + Panel de administración

Sitio de dos caras:

- **Tienda pública** (lo que ve cualquier visitante): catálogo de perfumes,
  decants por género (Hombre / Mujer / Unisex) y accesorios perfumeros, con
  buscador único en el header, indicadores de "Agotado" / "Últimas piezas",
  sección de confianza (garantía, envíos) y preguntas frecuentes. Solo
  lectura: cada tarjeta abre un detalle con toda la info del producto y un
  botón de WhatsApp para consultar/comprar.
- **Panel de administración** (oculto): inventario, ventas tipo punto de
  venta, clientes, dashboard con estadísticas, asistente con IA y ajustes
  (respaldo de datos). Se entra desde el enlace discreto **"Acceso
  administrador"** al pie de la tienda, protegido con contraseña + hash
  PBKDF2 + límite de intentos (ver sección "Seguridad").

## Cómo ejecutarlo en VS Code

1. Abre esta carpeta completa en VS Code.
2. En la terminal integrada:

   ```bash
   npm install
   npm run dev
   ```

3. Se abre en `http://localhost:5173` — pero así solo ves la **tienda**. El
   panel de administración necesita el backend corriendo también (ver abajo).

Requiere [Node.js](https://nodejs.org) 18+ (`node -v` para verificar).

> **Para probar el panel de administración completo en tu computadora**,
> usa `npm run dev:full` en vez de `npm run dev` — levanta la tienda y el
> backend juntos. Ver la sección "Base de datos en la nube" más abajo para
> la explicación completa (necesitas antes tener tu base de datos de
> MongoDB Atlas configurada, aunque sea la gratuita).

> **Ya incluí un archivo `.env` con una contraseña de administrador lista
> para que puedas entrar de inmediato: `JacoScents2026!`**. Cámbiala en
> cuanto puedas — especialmente antes de compartir este proyecto con
> alguien más o subirlo a un repositorio — con
> `node scripts/generar-hash-admin.mjs` (ver sección "Seguridad" más abajo).
> El archivo `.env` está en `.gitignore`, así que no se sube a Git por
> accidente.

## Estructura del proyecto

```
api/                          BACKEND (funciones serverless de Vercel)
  auth.js                      login: verifica contraseña, entrega token de sesión
  public.js                    catálogo público (sin login) + creación de pedidos web
  admin.js                     todas las operaciones del panel (requiere token)
  _lib/db.js                   conexión a MongoDB Atlas
  _lib/auth.js                 verificación de contraseña, tokens, bloqueo por intentos
  _lib/store.js                lógica de negocio (perfumes, ventas, inventario, pedidos)
src/
  main.jsx                   punto de entrada
  App.jsx                    raíz: decide tienda vs. admin + auto-logout por inactividad
  Tienda.jsx                 orquesta las páginas de la tienda pública
  AdminPanel.jsx              orquesta las pestañas del panel de admin
  apiClient.js                 llamadas al backend (api/) desde el navegador + token de sesión
  security.js                  saneamiento de datos de formularios (la contraseña vive en el servidor)
  hooks/
    useJacoData.js             estado + llamadas al backend + operaciones (fuente única de datos)
    useInactivityLogout.js     cierra la sesión de admin tras N minutos sin actividad
  constants.js                catálogos fijos, WhatsApp
  utils.js                    helpers (uid, money, fmtDate, whatsappLink, stockStateOf)
  data/defaults.js            formularios vacíos por defecto
  data/seedCatalog.json        catálogo inicial — se sube a MongoDB con scripts/migrar-a-mongodb.mjs
  styles.css                  Tailwind + tipografías + utilidades de diseño
  store/                      TIENDA PÚBLICA (solo lectura)
    StoreLayout.jsx            header/nav + buscador + footer con el acceso oculto a admin
    AdminGateModal.jsx         modal de contraseña
    TiendaHome.jsx             landing: hero, destacados, confianza, FAQ
    PerfumesPublicView.jsx
    DecantsPublicView.jsx      con sub-pestañas Hombre/Mujer/Unisex
    AccesoriosPublicView.jsx
    BusquedaView.jsx           resultados combinados del buscador del header
    ProductPublicCard.jsx      tarjeta de producto con badge de stock + CTA de WhatsApp
    ProductDetailModal.jsx     modal de detalle al hacer clic en una tarjeta
  components/                 PANEL DE ADMINISTRACIÓN + piezas compartidas
    UI.jsx, common.jsx, PerfumeCard.jsx, DecantCard.jsx
    modals.jsx                 formularios (perfume, cliente, accesorio, ajustes, ticket...)
    tabs/                      Dashboard, Catálogo, Decants, Accesorios, Ventas, Clientes, Asistente IA, Ajustes
scripts/
  generar-hash-admin.mjs      genera el hash de contraseña (correr con Node, no en el navegador)
  migrar-a-mongodb.mjs         sube tu catálogo/respaldo a MongoDB Atlas (una sola vez)
public/_headers                cabeceras de seguridad para Netlify
vercel.json                    cabeceras de seguridad para Vercel
```

## Seguridad

Con el backend en su lugar, la autenticación del panel ahora es **seguridad
real de servidor**, no solo una cortina del lado del navegador.

### Acceso al panel de administración

Al pie de cualquier página de la tienda hay un enlace pequeño y discreto:
**"Acceso administrador"**.

1. **Genera tu contraseña** (la primera vez, o cuando quieras cambiarla):

   ```bash
   node scripts/generar-hash-admin.mjs
   ```

   Te va a pedir la contraseña y te da una línea para pegar en tu `.env`
   local **y** en las variables de entorno de tu proyecto en Vercel:

   ```
   ADMIN_PASSWORD_HASH=pbkdf2$150000$...$...
   ```

   Ese script corre en **tu computadora con Node**, nunca en el navegador —
   así la contraseña en texto plano nunca viaja a ningún lado. Lo que se
   guarda es un hash PBKDF2 (150,000 iteraciones + sal aleatoria), y esa
   variable ya **no lleva el prefijo `VITE_`**: eso significa que el
   navegador nunca la recibe, solo existe dentro del servidor (las
   funciones en `api/`). Antes, con el prefijo `VITE_`, cualquiera podía
   extraer el hash del código del sitio e intentar atacarlo sin conexión —
   ya no es posible.

2. **Si no configuras `ADMIN_PASSWORD_HASH` en el servidor, el panel queda
   bloqueado por diseño**, y el login responde con un error claro en vez de
   dejar pasar a cualquiera.

3. **Límite de intentos, ahora real**: tras 5 contraseñas incorrectas
   seguidas, el acceso se bloquea temporalmente (20s, luego 40s, 80s... se
   duplica en cada racha de fallos). Este conteo vive en la base de datos,
   no en el navegador de quien intenta entrar — ya no se puede evadir
   borrando el almacenamiento local o probando desde una pestaña nueva.

4. **Sesión recordada por 30 días**: una vez que entras correctamente en un
   dispositivo, no te vuelve a pedir la contraseña en ese mismo
   navegador hasta que pase ese tiempo o cierres sesión manualmente (botón
   de salida en la esquina del panel). Cerrar sesión, o que se cierre sola
   por 15 minutos de inactividad, si borra esa sesión guardada.

### Datos que entran al sistema

Todos los formularios (perfume, cliente, accesorio, ajustes de inventario)
recortan espacios, limitan la longitud del texto, no permiten precios ni
cantidades negativas, y solo aceptan imágenes con URL `http(s)://`, rutas
locales del proyecto (`/img/...`) o fotos subidas por el propio formulario.

Además, ahora el **servidor** es quien de verdad decide si una operación se
ejecuta (crear una venta, cambiar el inventario, etc.) — nunca confía en lo
que mande el navegador sin antes revisar el token de sesión. Y al vender,
el descuento de inventario se hace de forma segura: si dos personas
intentan comprar el último decant al mismo tiempo, la base de datos
garantiza que solo una de las dos operaciones se complete.

### Cabeceras de seguridad al publicar el sitio

Si despliegas en **Netlify**, el archivo `public/_headers` ya incluido se
aplica automáticamente. Si despliegas en **Vercel**, `vercel.json` hace lo
mismo. Ambos configuran:
- `Content-Security-Policy` — limita de dónde se pueden cargar scripts,
  estilos y fuentes.
- `X-Frame-Options: DENY` — evita que alguien incruste tu sitio en un
  `<iframe>` ajeno (clickjacking).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
  — endurecimiento estándar recomendado por OWASP.

Si usas otro hosting, revisa su documentación para aplicar cabeceras
equivalentes (busca "custom headers" o "security headers").

### Respaldo y borrado de datos

En el panel, pestaña **Ajustes**, puedes:
- Exportar un respaldo completo en JSON.
- Restaurar un respaldo (reemplaza todos los datos actuales, pide
  confirmación).
- Borrar todos los datos del negocio (doble confirmación, no se puede
  deshacer).

Respalda seguido — todo vive en el `localStorage` de este navegador
únicamente (ver siguiente sección).

## Diseño

Tipografía: **Quicksand** para títulos y **Inter** (con Arial como
respaldo) para el resto del texto — nada de cursivas. Los textos sobre
fondo claro usan tonos oscuros para buena legibilidad; el dorado se
reserva para acentos y fondos oscuros.

## Configuración pendiente

En el panel de administración, pestaña **Ajustes**, hay una tarjeta que
revisa automáticamente si falta configurar algo (WhatsApp real, Asistente
IA, buscador de perfumes) — para que no te enteres hasta que un cliente se
queje.

## Datos y almacenamiento

Este proyecto tiene backend real: todo (perfumes, decants, accesorios,
clientes, ventas, movimientos, pedidos) vive en **MongoDB Atlas** (base de
datos en la nube, capa gratuita). El navegador ya no guarda el catálogo ni
el inventario — solo un token de sesión para no pedirte la contraseña cada
vez. Puedes entrar desde cualquier dispositivo con la misma contraseña de
administrador y vas a ver siempre la misma información, actualizada al
segundo, sin depender de que tu computadora esté prendida.

Ver la sección **"Base de datos en la nube (MongoDB Atlas + Vercel)"** más
abajo para la guía completa de cómo dejarlo funcionando.

### Fotos de producto

Al agregar un perfume o accesorio hay tres formas de ponerle foto:
- **Ruta local** (recomendada para tu catálogo principal): la foto vive como
  archivo real dentro de `public/img/perfumes/` (o `public/img/accesorios/`)
  del proyecto. Es la más rápida de cargar y no ocupa espacio en la base de
  datos. Ver `public/img/perfumes/LEEME.txt`.
- **Subir foto**: se comprime y se guarda directo en MongoDB junto con el
  perfume. Cómoda para altas rápidas desde el celular, pero ocupa espacio de
  tu base de datos (la capa gratuita de Atlas da 512MB — de sobra para texto
  e inventario, pero las fotos pueden consumirlo rápido si subes muchas).
- **Pegar URL**: si ya tienes la imagen alojada en otro lado (Cloudinary,
  Imgur, tu propio hosting).

## Base de datos en la nube (MongoDB Atlas + Vercel)

La tienda y el panel corren como una sola aplicación en **Vercel** (gratis),
que además hospeda el backend (carpeta `api/`) que habla con **MongoDB
Atlas** (gratis, para siempre, en la nube). No necesitas tu computadora
prendida para que la tienda funcione.

### 1. Crear tu base de datos gratuita (MongoDB Atlas)

1. Entra a **[mongodb.com/cloud/atlas/register](https://mongodb.com/cloud/atlas/register)** y crea una cuenta gratis.
2. Cuando te pida crear un clúster, elige el plan **M0 (Free)**.
3. En "Security" → "Database Access", crea un usuario y contraseña para tu
   base de datos (guárdalos, los vas a necesitar).
4. En "Security" → "Network Access", agrega la IP `0.0.0.0/0` ("Allow
   access from anywhere") — es necesario porque Vercel no tiene una IP fija.
5. Ve a "Database" → botón **Connect** → **Drivers** → copia la
   "connection string" (se ve algo así:
   `mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/`).
   Sustituye `<password>` por la contraseña real que creaste en el paso 3.

### 2. Subir el proyecto a Vercel

1. Sube este proyecto a un repositorio de GitHub (puedes arrastrar la
   carpeta a [github.com/new](https://github.com/new) o usar VS Code).
2. Entra a **[vercel.com](https://vercel.com)**, crea una cuenta gratis
   (puedes usar "Continuar con GitHub").
3. **Add New → Project**, elige tu repositorio.
4. Antes de darle "Deploy", abre **Environment Variables** y agrega:
   - `MONGODB_URI` → la connection string del paso anterior
   - `MONGODB_DB` → `jaco_scents`
   - `ADMIN_PASSWORD_HASH` → el valor que tienes en tu `.env` (o genera uno
     nuevo con `node scripts/generar-hash-admin.mjs`)
   - `SESSION_SECRET` → el valor que tienes en tu `.env`
   - `VITE_WHATSAPP_NUMBER` → tu número con lada de país, sin espacios ni signos
5. Dale **Deploy**. En un par de minutos te da una URL pública
   (`algo.vercel.app`) — esa ya es tu tienda funcionando 24/7.

### 3. Subir tu catálogo actual a la base de datos (una sola vez)

Desde tu computadora, en la carpeta del proyecto:

```bash
MONGODB_URI="tu-connection-string-completa" node scripts/migrar-a-mongodb.mjs
```

Esto sube lo que hay en `src/data/seedCatalog.json` a tu base de datos. Si
en vez de eso quieres migrar un respaldo que ya exportaste desde el panel
("Ajustes → Exportar respaldo"), pásale la ruta del archivo:

```bash
MONGODB_URI="tu-connection-string-completa" node scripts/migrar-a-mongodb.mjs ruta/a/tu-respaldo.json
```

### 4. Trabajar en el proyecto localmente (en tu computadora)

Como ahora hay backend, `npm run dev` solo (Vite) ya no sirve para probar
el panel de administración completo — las llamadas a `/api/...` no
existirían. Usa en su lugar:

```bash
npm install
npm run dev:full
```

Esto usa `vercel dev`, que sirve la tienda Y el backend juntos, leyendo tu
`.env` local. La primera vez te va a pedir iniciar sesión con tu cuenta de
Vercel (`vercel login`) y ligar la carpeta a tu proyecto (`vercel link`) —
sigue las instrucciones que te va mostrando en la terminal.

### ¿Por qué esta combinación y no otra?

- **MongoDB Atlas M0**: es gratis para siempre (no es una prueba de 30
  días), nunca se "apaga" por inactividad, y tiene de sobra (512MB) para el
  catálogo, ventas y clientes de un negocio de este tamaño.
- **Vercel**: hospeda la tienda y el backend juntos gratis, sin que tu
  computadora tenga que estar prendida, y sin los "tiempos de espera" que
  tienen otras opciones gratuitas cuando nadie ha entrado en un rato.

Si más adelante el negocio crece mucho (miles de ventas, varios empleados
usando el panel a la vez), ambos servicios tienen planes de pago a los que
puedes subir sin cambiar nada del código.

## Botón de WhatsApp en la tienda


Cada producto de la tienda pública tiene un botón "Consultar" que abre
WhatsApp con un mensaje pre-armado. Configura tu número en `.env`:

```
VITE_WHATSAPP_NUMBER=52155XXXXXXXX
```

(lada de país + número, sin `+` ni espacios).

## Buscador de perfumes (autocompletar al agregar uno nuevo)

En el formulario "Nuevo perfume" hay un cuadro "Autocompletar con IA": el
admin escribe el nombre del perfume, se busca en internet y se llenan
automáticamente marca, casa perfumera, género, tipo, notas, concentración,
etc. — **el precio de compra y venta los define siempre el negocio**, nunca
se autocompletan.

Esto requiere un backend/proxy propio (la API de Anthropic no puede
llamarse directo desde el navegador: necesita tu API key en secreto y no
admite peticiones desde el cliente por CORS). Ejemplo mínimo con
Node/Express, usando la herramienta de búsqueda web de Claude:

```js
// server.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/buscar-perfume", async (req, res) => {
  const { nombre } = req.body;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Busca información real del perfume "${nombre}". Responde
ÚNICAMENTE un objeto JSON (sin texto ni markdown alrededor) con estas
claves: nombre, marca, casaPerfumera, genero (uno de: Masculino, Femenino,
Unisex), tipo (uno de: EDT, EDP, Parfum, Elixir, Extrait, Cologne),
concentracion, presentacionMl (número, la presentación más común),
temporada (uno de: Primavera, Verano, Otoño, Invierno, Todo el año),
notas (string corto con las notas principales separadas por coma),
descripcion (1-2 frases), inspiracion (string vacío si no es un dupe).
Si no encuentras el perfume con certeza, responde {"encontrado": false}.`,
      }],
    }),
  });
  const data = await r.json();
  const texto = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  try {
    const json = JSON.parse(texto.replace(/```json|```/g, "").trim());
    res.json(json);
  } catch {
    res.json({ encontrado: false });
  }
});

app.listen(8788, () => console.log("Proxy de búsqueda escuchando en :8788"));
```

Luego en tu `.env`:

```
VITE_AI_PERFUME_LOOKUP_URL=http://localhost:8788/api/buscar-perfume
```

## Asistente IA (pestaña del panel de administración)

Mismo caso: necesita su propio proxy. Ver el ejemplo de servidor en el
código anterior — es el mismo patrón, solo cambia el prompt. Configúralo
con:

```
VITE_AI_PROXY_URL=http://localhost:8787/api/asistente
```

Puedes correr ambos endpoints (`/api/asistente` y `/api/buscar-perfume`) en
el mismo servidor Express si prefieres un solo proceso.

## Compilar para producción

```bash
npm run build
```

Genera `dist/` (la parte visual del sitio). Pero como el proyecto ahora
incluye backend (carpeta `api/`), ya **no basta con subir `dist/` a
cualquier hosting estático** (GitHub Pages, Netlify sin adaptar, etc.) — las
funciones de `api/` están escritas en el formato que entiende **Vercel**.
Para desplegarlo, sigue la sección "Base de datos en la nube (MongoDB Atlas
+ Vercel)" de este README: ahí Vercel se encarga de compilar `dist/` y de
correr `api/` junto con la tienda, todo en un solo paso al conectar tu
repositorio.
