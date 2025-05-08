import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getEmploymentData } from "./controllers/employmentDataController";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employment data route
  app.get('/api/employment-data', getEmploymentData);

  // Serve the simple static HTML dashboard
  app.get('/', (req, res) => {
    const htmlPath = path.resolve('./client/index.html');
    console.log(`Attempting to serve HTML file from: ${htmlPath}`);
    res.sendFile(htmlPath);
  });

  // Add more API routes as needed

  const httpServer = createServer(app);

  return httpServer;
}
