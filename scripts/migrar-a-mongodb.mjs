#!/usr/bin/env node
// Sube tu catálogo a MongoDB Atlas. Se corre UNA VEZ (o cada vez que quieras
// reemplazar todo lo que hay en la base de datos por un archivo nuevo).
//
// Uso:
//   MONGODB_URI="tu-connection-string" node scripts/migrar-a-mongodb.mjs
//   MONGODB_URI="..." node scripts/migrar-a-mongodb.mjs respaldo-exportado.json
//
// Si no le pasas un archivo, usa src/data/seedCatalog.json (el catálogo
// inicial del proyecto). Si le pasas la ruta de un .json exportado desde
// "Ajustes → Exportar respaldo" del panel, migra también clientes, ventas y
// movimientos, no solo el catálogo.
import { MongoClient } from "mongodb";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uid = (prefix = "") => prefix + randomBytes(9).toString("base64url");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "jaco_scents";
if (!uri) {
  console.error("\n⚠️  Falta la variable de entorno MONGODB_URI. Ejemplo:\n");
  console.error('   MONGODB_URI="mongodb+srv://usuario:contraseña@cluster.mongodb.net/" node scripts/migrar-a-mongodb.mjs\n');
  process.exit(1);
}

const archivoArg = process.argv[2];
const archivo = archivoArg ? path.resolve(archivoArg) : path.resolve(__dirname, "../src/data/seedCatalog.json");
console.log(`Leyendo: ${archivo}`);
const raw = JSON.parse(readFileSync(archivo, "utf-8"));

const toDoc = (item) => {
  const { id, ...rest } = item;
  return { _id: id || uid(), ...rest, _creadoEn: Date.now() };
};

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log(`Conectado a la base "${dbName}".`);

  const colecciones = {
    perfumes: raw.perfumes || [],
    accesorios: raw.accesorios || [],
    clientes: raw.clientes || [],
    ventas: raw.ventas || [],
    movimientos: raw.movimientos || [],
  };

  for (const [nombre, items] of Object.entries(colecciones)) {
    if (!items.length) continue;
    const col = db.collection(nombre);
    const existentes = await col.countDocuments();
    if (existentes > 0) {
      console.log(`⚠️  "${nombre}" ya tiene ${existentes} documento(s). Se borran antes de migrar (para no duplicar).`);
      await col.deleteMany({});
    }
    await col.insertMany(items.map(toDoc));
    console.log(`✔ ${nombre}: ${items.length} documento(s) migrados.`);
  }

  await client.close();
  console.log("\n✅ Migración completa.\n");
}

main().catch((err) => {
  console.error("\n❌ Error migrando:", err.message);
  process.exit(1);
});
