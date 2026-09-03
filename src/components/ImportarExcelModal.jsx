import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Modal } from "./UI";
import { sanitizeText, sanitizeUrl, clampNumber } from "../security";
import { GENEROS } from "../constants";

// Encabezados aceptados por columna (en minúsculas, sin acentos) — así el
// negocio puede traer su propia hoja sin tener que renombrar columnas para
// que coincidan exactamente con nuestros nombres internos.
const ALIASES = {
  nombre: ["nombre", "perfume", "producto", "nombre del perfume"],
  marca: ["marca", "casa", "casa perfumera", "marca/casa"],
  precioVenta: ["precio", "precio venta", "precio de venta", "precioventa"],
  cantidadDisponible: ["cantidad", "stock", "existencias", "cantidad disponible", "inventario"],
  genero: ["genero", "género"],
  imagenUrl: ["imagen", "foto", "imagen url", "url imagen"],
};

function normalizeHeader(h) {
  return String(h || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function detectColumn(headers, campo) {
  const opciones = ALIASES[campo];
  return headers.find((h) => opciones.includes(normalizeHeader(h)));
}

export default function ImportarExcelModal({ open, onClose, onImport }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState(null); // filas crudas del archivo
  const [colMap, setColMap] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [importando, setImportando] = useState(false);

  const reset = () => { setFileName(""); setRows(null); setColMap(null); setError(""); };

  const handleFile = async (file) => {
    setError("");
    setLoading(true);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const hoja = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(hoja, { defval: "" });
      if (!json.length) {
        setError("El archivo no tiene filas de datos, o la primera hoja está vacía.");
        setLoading(false);
        return;
      }
      const headers = Object.keys(json[0]);
      const map = {
        nombre: detectColumn(headers, "nombre"),
        marca: detectColumn(headers, "marca"),
        precioVenta: detectColumn(headers, "precioVenta"),
        cantidadDisponible: detectColumn(headers, "cantidadDisponible"),
        genero: detectColumn(headers, "genero"),
        imagenUrl: detectColumn(headers, "imagenUrl"),
      };
      if (!map.nombre || !map.precioVenta) {
        setError("No pude identificar las columnas de Nombre y Precio. Revisa que tu hoja tenga encabezados como \"Nombre\" y \"Precio\" (o \"Precio de venta\") en la primera fila.");
        setLoading(false);
        return;
      }
      setFileName(file.name);
      setRows(json);
      setColMap(map);
    } catch (err) {
      setError("No pude leer ese archivo. Asegúrate de que sea .xlsx, .xls o .csv exportado desde Excel/Sheets.");
    }
    setLoading(false);
  };

  const preview = rows && colMap
    ? rows.map((r) => ({
        nombre: sanitizeText(r[colMap.nombre], 120),
        marca: colMap.marca ? sanitizeText(r[colMap.marca], 80) : "",
        precioVenta: clampNumber(parseFloat(r[colMap.precioVenta]) || 0, { min: 0, max: 999999 }),
        cantidadDisponible: colMap.cantidadDisponible ? Math.max(0, Math.round(parseFloat(r[colMap.cantidadDisponible]) || 0)) : 0,
        genero: colMap.genero && GENEROS.includes(String(r[colMap.genero]).trim()) ? String(r[colMap.genero]).trim() : "",
        imagenUrl: colMap.imagenUrl ? sanitizeUrl(r[colMap.imagenUrl]) : "",
      })).filter((r) => r.nombre)
    : [];

  const confirmar = async () => {
    const lista = preview.map((p) => ({
      nombre: p.nombre, marca: p.marca, casaPerfumera: "", genero: p.genero, tipo: "", concentracion: "",
      presentacionMl: "", imagenUrl: p.imagenUrl, sku: "", codigoBarras: "", notas: "", descripcion: "",
      inspiracion: "", temporada: "", precioCompra: "", precioVenta: p.precioVenta, costoPromedio: "",
      proveedor: "", fechaCompra: "", cantidadDisponible: p.cantidadDisponible, cantidadMinima: 1, activo: true,
      ubicacionFisica: "", observaciones: "", destacado: false,
      decant: { habilitado: false, mlTotalAbierto: 0, mlDisponible: 0, precioPorMl: "", tamanos: [], preciosPorTamano: {} },
      tieneFrascoCompleto: false,
    }));
    setImportando(true);
    setError("");
    const ok = await onImport(lista);
    setImportando(false);
    if (ok) {
      reset();
      onClose();
    } else {
      setError("No se pudo completar la importación. Revisa tu conexión e intenta de nuevo — no se perdió tu archivo, puedes reintentar.");
    }
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Importar catálogo desde Excel" maxWidth="max-w-2xl">
      {!rows ? (
        <div>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-300 rounded-xl py-10 cursor-pointer hover:border-neutral-500 transition-colors">
            <UploadCloud size={28} className="text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700">{loading ? "Leyendo archivo..." : "Selecciona tu archivo .xlsx, .xls o .csv"}</span>
            <span className="text-xs text-neutral-400">La primera fila debe tener los encabezados (Nombre, Marca, Precio, Cantidad...)</span>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
          </label>
          {error && (
            <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /> <span>{error}</span>
            </div>
          )}
          <p className="text-xs text-neutral-400 mt-4">Solo se importan 5 datos por producto: Nombre, Marca, Precio de venta, Cantidad disponible e Imagen (si tu hoja trae una URL). El resto lo puedes completar después editando cada perfume.</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3 text-sm text-neutral-600">
            <FileSpreadsheet size={16} /> <span className="font-medium">{fileName}</span>
            <span className="text-neutral-400">· {preview.length} de {rows.length} filas listas para importar</span>
          </div>
          <div className="max-h-72 overflow-y-auto border border-neutral-200 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-neutral-50 sticky top-0">
                <tr className="text-left text-neutral-500">
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Marca</th>
                  <th className="px-3 py-2 font-medium">Precio</th>
                  <th className="px-3 py-2 font-medium">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 200).map((r, i) => (
                  <tr key={i} className="border-t border-neutral-100">
                    <td className="px-3 py-1.5 text-neutral-800">{r.nombre}</td>
                    <td className="px-3 py-1.5 text-neutral-500">{r.marca || "—"}</td>
                    <td className="px-3 py-1.5 text-neutral-500">${r.precioVenta}</td>
                    <td className="px-3 py-1.5 text-neutral-500">{r.cantidadDisponible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length !== preview.length && (
            <p className="text-xs text-amber-600 mt-2">{rows.length - preview.length} fila(s) se omitieron por no tener nombre.</p>
          )}
          <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-200">
            <button onClick={reset} disabled={importando} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 disabled:opacity-50">Elegir otro archivo</button>
            <button onClick={confirmar} disabled={importando} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-neutral-800 disabled:opacity-60">
              <CheckCircle2 size={16} /> {importando ? "Importando..." : `Importar ${preview.length}`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
