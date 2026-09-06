import "dotenv/config"; // Ajoutez cette ligne au tout début
import { db } from "../db.js";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("🔄 Ajout des colonnes last_login_at et previous_login_at...");
  
  // Vérifier que DATABASE_URL est chargé
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL non trouvé dans .env");
    console.log("📁 Vérifiez que le fichier .env existe avec la variable DATABASE_URL");
    process.exit(1);
  }
  
  console.log(`📊 Connexion à la base de données...`);
  
  try {
    // Ajouter la colonne last_login_at
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP
    `);
    console.log("✅ Colonne last_login_at ajoutée");
    
    // Ajouter la colonne previous_login_at
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS previous_login_at TIMESTAMP
    `);
    console.log("✅ Colonne previous_login_at ajoutée");
    
    console.log("🎉 Migration terminée avec succès!");
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    throw error;
  }
}

migrate();