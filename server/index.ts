import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { createServer } from "http";
import { seedDatabase } from "./seed.js";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    await registerRoutes(httpServer, app);
  } catch (err) {
    console.error("❌ Erreur lors de l'enregistrement des routes:", err);
    process.exit(1);
  }

  try {
    await seedDatabase();
  } catch (err) {
    console.error("⚠️ Erreur seed:", err);
  }

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // Configuration pour la production
  if (process.env.NODE_ENV === "production") {
    const possiblePaths = [
      path.resolve(__dirname, "public"),
      path.resolve(__dirname, "../dist/public"),
      path.resolve(process.cwd(), "dist/public"),
    ];
    
    let distPath = null;
    for (const testPath of possiblePaths) {
      if (existsSync(testPath)) {
        distPath = testPath;
        break;
      }
    }
    
    if (distPath && existsSync(distPath)) {
      log(`📁 Serving static files from ${distPath}`);
      app.use(express.static(distPath));
      
      // CORRECTION POUR EXPRESS 5 : utiliser une fonction middleware au lieu de app.get("*")
      app.use((req, res, next) => {
        // Ignorer les routes API
        if (req.path.startsWith("/api")) {
          return next();
        }
        // Servir index.html pour toutes les autres routes
        const indexPath = path.join(distPath!, "index.html");
        if (existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          next();
        }
      });
    } else {
      log("⚠️ Aucun dossier de fichiers statiques trouvé");
    }
  } else {
    const { setupVite } = await import("./vite.js");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "3001", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`✅ Serveur démarré sur le port ${port}`);
      log(`🌐 App disponible sur http://localhost:${port}`);
      if (process.env.NODE_ENV === "production") {
        log(`🚀 Mode production actif`);
      }
    },
  );
})();