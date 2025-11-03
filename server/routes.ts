import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertMarketBenchmarkSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get single project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Create project
  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      
      // Also create a market benchmark entry for data collection
      const complexityRatings = validatedData.complexityRatings as Record<string, number>;
      const avgComplexity = Object.values(complexityRatings).reduce((a, b) => a + b, 0) / 
                            Object.values(complexityRatings).length;
      
      await storage.createMarketBenchmark({
        projectType: validatedData.projectType,
        averageComplexity: avgComplexity.toString(),
        price: validatedData.finalPrice,
        skillLevel: validatedData.skillLevel || null,
      });
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const updated = await storage.updateProject(req.params.id, validatedData);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Get market benchmarks
  app.get("/api/market-benchmarks/:projectType?", async (req, res) => {
    try {
      const projectType = req.params.projectType;
      const benchmarks = await storage.getMarketBenchmarks(projectType);
      res.json(benchmarks);
    } catch (error) {
      console.error("Error fetching market benchmarks:", error);
      res.status(500).json({ error: "Failed to fetch market benchmarks" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
