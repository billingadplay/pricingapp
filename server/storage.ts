import { 
  projects, 
  marketBenchmarks,
  type Project, 
  type InsertProject,
  type MarketBenchmark,
  type InsertMarketBenchmark 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Market Benchmarks
  getMarketBenchmarks(projectType?: string): Promise<MarketBenchmark[]>;
  createMarketBenchmark(benchmark: InsertMarketBenchmark): Promise<MarketBenchmark>;
}

export class DatabaseStorage implements IStorage {
  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values({
        ...insertProject,
        updatedAt: new Date(),
      })
      .returning();
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Market Benchmarks
  async getMarketBenchmarks(projectType?: string): Promise<MarketBenchmark[]> {
    if (projectType) {
      return await db
        .select()
        .from(marketBenchmarks)
        .where(eq(marketBenchmarks.projectType, projectType))
        .orderBy(desc(marketBenchmarks.createdAt));
    }
    return await db.select().from(marketBenchmarks).orderBy(desc(marketBenchmarks.createdAt));
  }

  async createMarketBenchmark(insertBenchmark: InsertMarketBenchmark): Promise<MarketBenchmark> {
    const [benchmark] = await db
      .insert(marketBenchmarks)
      .values(insertBenchmark)
      .returning();
    return benchmark;
  }
}

export const storage = new DatabaseStorage();
