import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Chargement explicite du .env pour Windows (nécessaire quand tsx ne charge pas --env-file)
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL manquant. Vérifiez votre fichier .env à la racine du projet."
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
