// Conexión a MongoDB Atlas, reutilizada entre invocaciones de las funciones
// serverless de Vercel (evita abrir una conexión nueva en cada petición,
// que agotaría rápido las conexiones disponibles del clúster gratuito).
//
// Requiere la variable de entorno MONGODB_URI (la connection string que te
// da MongoDB Atlas) y opcionalmente MONGODB_DB (nombre de la base; si no se
// define, se usa "jaco_scents").
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "jaco_scents";

if (!uri) {
  console.error("Falta la variable de entorno MONGODB_URI.");
}

// En serverless, el módulo puede quedar "caliente" entre invocaciones del
// mismo contenedor — usamos una variable global para no reconectar cada vez.
let cachedClient = globalThis.__jacoMongoClient;
let cachedPromise = globalThis.__jacoMongoPromise;

function getClientPromise() {
  if (cachedPromise) return cachedPromise;
  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 8000,
  });
  cachedPromise = client.connect().then((c) => {
    cachedClient = c;
    globalThis.__jacoMongoClient = c;
    return c;
  });
  globalThis.__jacoMongoPromise = cachedPromise;
  return cachedPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(dbName);
}

export async function getCollections() {
  const db = await getDb();
  return {
    perfumes: db.collection("perfumes"),
    accesorios: db.collection("accesorios"),
    clientes: db.collection("clientes"),
    ventas: db.collection("ventas"),
    movimientos: db.collection("movimientos"),
    pedidos: db.collection("pedidos_web"),
    seguridad: db.collection("seguridad"), // control de intentos fallidos de login
  };
}
