import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL manquant. Vérifiez votre fichier .env");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL activé pour Render (production)
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  // Paramètres optimisés
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test de connexion au démarrage
pool.on("error", (err) => {
  console.error("Erreur pool PostgreSQL:", err.message);
});

// Vérifier la connexion
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Erreur de connexion à PostgreSQL:", err.message);
  } else {
    console.log("✅ Connecté à PostgreSQL avec succès");
    release();
  }
});

export const db = drizzle(pool, { schema });
export { pool };