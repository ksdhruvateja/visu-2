import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getEmploymentData } from "./controllers/employmentDataController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employment data route
  app.get('/api/employment-data', getEmploymentData);

  // Add more API routes as needed

  const httpServer = createServer(app);

  return httpServer;
}
