#!/usr/bin/env node
// Genera el hash de contraseña para ADMIN_PASSWORD_HASH (variable del
// servidor — ya no lleva el prefijo VITE_, así el navegador nunca la ve).
// Uso:
//   node scripts/generar-hash-admin.mjs "miContraseñaSegura"
// o, sin argumento, te la pide de forma interactiva:
//   node scripts/generar-hash-admin.mjs

import { randomBytes, pbkdf2Sync } from "node:crypto";
import readline from "node:readline";

const ITERATIONS = 150000;

function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");
  return `pbkdf2$${ITERATIONS}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

function printResult(password) {
  if (!password || password.length < 8) {
    console.error("\n⚠️  Usa una contraseña de al menos 8 caracteres (mejor 12+, con números y símbolos).\n");
    process.exit(1);
  }
  console.log("\nAgrega esta línea a tu archivo .env, y a las variables de entorno de Vercel\n(y borra la anterior si la tenías):\n");
  console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}\n`);
}

const argPassword = process.argv[2];
if (argPassword) {
  printResult(argPassword);
} else {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("Escribe la nueva contraseña de administrador: ", (pw) => {
    rl.close();
    printResult(pw);
  });
}
