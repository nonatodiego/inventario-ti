import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  
  
  // PDF Export Route (MUST be before tRPC middleware)
  app.post("/api/export-pdf/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const recordId = parseInt(id);
      
      if (isNaN(recordId)) {
        res.status(400).setHeader("Content-Type", "application/json").json({ error: "ID invalido" });
        return;
      }
      
      const { getInventoryRecordById } = await import("../inventory");
      const { getCollaboratorSystemAccessWithDetails } = await import("../systems");
      const { generateUserInventoryPDF } = await import("../pdfGenerator");
      
      const record = await getInventoryRecordById(recordId);
      if (!record) {
        res.status(404).setHeader("Content-Type", "application/json").json({ error: "Registro nao encontrado" });
        return;
      }
      
      const systemAccess = await getCollaboratorSystemAccessWithDetails(recordId);
      const pdfBuffer = await generateUserInventoryPDF(record, systemAccess);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${record.userName}_inventario.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      
      res.end(pdfBuffer);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      res.status(500).setHeader("Content-Type", "application/json").json({ error: "Erro ao gerar PDF" });
    }
  });
  
  // tRPC API (must be after specific routes like PDF export)
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 4000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
