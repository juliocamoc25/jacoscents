import React, { useRef, useState } from "react";
import { Upload, Link2, X, Loader2, FolderCog } from "lucide-react";
import { slugify } from "../utils";

const MAX_DIMENSION = 900; // px, lado más largo
const JPEG_QUALITY = 0.82;

// Redimensiona y comprime una imagen en el navegador (canvas) y regresa un
// data URI base64 listo para guardar. Así el producto no necesita subir sus
// fotos a ningún servicio externo — pero el resultado se guarda dentro del
// localStorage, así que lo mantenemos ligero (unos cientos de KB máximo).
function fileToCompressedDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) { reject(new Error("El archivo no es una imagen.")); return; }
    if (file.size > 12 * 1024 * 1024) { reject(new Error("La imagen es demasiado pesada (máx. 12MB antes de comprimir).")); return; }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo procesar la imagen."));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

// Campo de imagen con tres formas de cargarla: subir un archivo (se
// comprime y guarda como data URI, útil para pruebas rápidas), pegar una
// URL externa, o usar la ruta local sugerida dentro del proyecto — esta
// última es la recomendada para producción: la imagen vive como archivo
// real dentro de /public, así que se ve igual desde cualquier dispositivo
// una vez que subas la página a internet.
// `folder` = carpeta dentro de /public/img (ej. "perfumes", "accesorios").
// `slugSource` = texto para generar el nombre de archivo (ej. marca + nombre).
export default function ImageField({ value, onChange, label = "Imagen", folder = "perfumes", slugSource = "" }) {
  const fileRef = useRef(null);
  const [mode, setMode] = useState("local"); // "local" | "upload" | "url"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rutaSugerida = slugSource ? `/img/${folder}/${slugify(slugSource)}.jpg` : "";

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err.message || "No se pudo cargar la imagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</label>
        <div className="flex rounded-full bg-neutral-100 p-0.5">
          <button type="button" onClick={() => setMode("local")} className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${mode === "local" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500"}`}>Ruta local</button>
          <button type="button" onClick={() => setMode("upload")} className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${mode === "upload" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500"}`}>Subir foto</button>
          <button type="button" onClick={() => setMode("url")} className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${mode === "url" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500"}`}>Pegar URL</button>
        </div>
      </div>

      {value && (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 mb-2">
          <img src={value} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Quitar imagen"
            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {mode === "local" ? (
        <div>
          <button
            type="button"
            onClick={() => rutaSugerida && onChange(rutaSugerida)}
            disabled={!rutaSugerida}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-50"
          >
            <FolderCog size={15} />
            {rutaSugerida ? "Usar ruta local sugerida" : "Escribe marca y nombre primero"}
          </button>
          {rutaSugerida && (
            <p className="text-[11px] text-neutral-500 mt-1.5">
              Ruta: <code className="bg-neutral-100 px-1 py-0.5 rounded">{rutaSugerida}</code>. Guarda tu foto con ese nombre exacto
              dentro de <code className="bg-neutral-100 px-1 py-0.5 rounded">public/img/{folder}/</code> en el proyecto (y vuelve a
              publicar el sitio). No sube el archivo por ti — solo arma la ruta para que la fotos vivan en el proyecto y se vean
              igual en cualquier dispositivo.
            </p>
          )}
        </div>
      ) : mode === "upload" ? (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {loading ? "Procesando..." : value ? "Cambiar foto" : "Elegir foto desde tu dispositivo"}
          </button>
          <p className="text-[11px] text-neutral-400 mt-1">Se guarda solo en este navegador (no se ve en otros dispositivos). Para producción, mejor usa "Ruta local".</p>
        </div>
      ) : (
        <div className="relative">
          <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={value && value.startsWith("http") ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
      )}
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
