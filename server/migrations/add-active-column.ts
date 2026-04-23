import "dotenv/config";
import { db } from "../db.js";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("🔄 Ajout de la colonne active dans la table users...");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL non trouvé dans .env");
    process.exit(1);
  }

  try {
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT false
    `);
    console.log("✅ Colonne active ajoutée");
    console.log("🎉 Migration terminée avec succès!");
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    throw error;
  }
}

migrate();
