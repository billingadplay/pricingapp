import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Project types enum
export const projectTypes = [
  "company_profile",
  "ads_commercial",
  "fashion",
  "event_documentation",
  "youtube",
  "animation_video"
] as const;

export type ProjectType = typeof projectTypes[number];

// Skill levels
export const skillLevels = ["beginner", "intermediate", "pro"] as const;
export type SkillLevel = typeof skillLevels[number];

// Projects table - stores all quotations and project data
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectType: text("project_type").notNull(),
  clientName: text("client_name"),
  projectTitle: text("project_title").notNull(),
  
  // Complexity ratings (1-10 scale)
  complexityRatings: jsonb("complexity_ratings").notNull().$type<Record<string, number>>(),
  complexityMultiplier: decimal("complexity_multiplier", { precision: 10, scale: 2 }).notNull(),
  
  // Base costs
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }).notNull(),
  
  // Personal goals (optional)
  monthlyIncomeGoal: decimal("monthly_income_goal", { precision: 10, scale: 2 }),
  livingCost: decimal("living_cost", { precision: 10, scale: 2 }),
  skillLevel: text("skill_level"),
  
  // Crew and equipment
  crewCosts: jsonb("crew_costs").$type<Array<{ role: string; hourlyRate: number; hours: number }>>(),
  equipmentCosts: jsonb("equipment_costs").$type<Array<{ item: string; cost: number }>>(),
  
  // Final pricing
  recommendedPrice: decimal("recommended_price", { precision: 10, scale: 2 }).notNull(),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).notNull(),
  
  // Quotation details
  selectedTemplate: text("selected_template"),
  quotationNotes: text("quotation_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Market benchmark data - anonymized pricing data from all users
export const marketBenchmarks = pgTable("market_benchmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectType: text("project_type").notNull(),
  averageComplexity: decimal("average_complexity", { precision: 10, scale: 2 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  skillLevel: text("skill_level"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects, {
  projectType: z.enum(projectTypes),
  projectTitle: z.string().min(1, "Project title is required"),
  baseCost: z.string().or(z.number()),
  complexityMultiplier: z.string().or(z.number()),
  recommendedPrice: z.string().or(z.number()),
  finalPrice: z.string().or(z.number()),
  monthlyIncomeGoal: z.string().or(z.number()).optional(),
  livingCost: z.string().or(z.number()).optional(),
  skillLevel: z.enum(skillLevels).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketBenchmarkSchema = createInsertSchema(marketBenchmarks, {
  projectType: z.enum(projectTypes),
  averageComplexity: z.string().or(z.number()),
  price: z.string().or(z.number()),
  skillLevel: z.enum(skillLevels).optional(),
}).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertMarketBenchmark = z.infer<typeof insertMarketBenchmarkSchema>;
export type MarketBenchmark = typeof marketBenchmarks.$inferSelect;

// Complexity questions configuration
export type ComplexityQuestion = {
  id: string;
  question: string;
  description?: string;
  weight: number;
  applicableTypes?: ProjectType[];
};

export const complexityQuestions: ComplexityQuestion[] = [
  {
    id: "portfolio_value",
    question: "Apakah proyek ini keren untuk ditaruh di portfolio?",
    description: "Seberapa bangga kamu menampilkan hasil ini di portfolio profesional?",
    weight: 1.0,
  },
  {
    id: "creative_complexity",
    question: "Banyak request/brief rumit/perlu storyboard & kreativitas tinggi?",
    description: "Tingkat kesulitan kreatif dan persiapan pre-production",
    weight: 1.2,
  },
  {
    id: "revision_risk",
    question: "Kemungkinan gagal, take ulang, revisi tinggi?",
    description: "Estimasi risiko revision dan iterasi tambahan",
    weight: 1.1,
  },
  {
    id: "outsourcing_need",
    question: "Perlu outsource (editor/animator/VO) di luar circle?",
    description: "Apakah perlu hire talent eksternal untuk menyelesaikan project?",
    weight: 1.15,
  },
  {
    id: "client_diy_difficulty",
    question: "Seberapa sulit klien bikin sendiri tanpa lu?",
    description: "Nilai expertise dan skill level yang kamu bawa ke project",
    weight: 1.0,
  },
  {
    id: "company_scale",
    question: "Skala perusahaan (UMKM–Enterprise)?",
    description: "Ukuran dan budget capacity klien",
    weight: 1.3,
    applicableTypes: ["company_profile", "ads_commercial", "animation_video"],
  },
  {
    id: "hospitality_needs",
    question: "Kira² client perlu Hospitality, tailored deck, offline meeting intensif?",
    description: "Level profesionalisme dan presentasi yang dibutuhkan",
    weight: 1.1,
    applicableTypes: ["company_profile", "ads_commercial", "fashion", "animation_video"],
  },
  {
    id: "client_type",
    question: "Clientnya product/service?",
    description: "Tipe bisnis klien (product-based vs service-based)",
    weight: 0.9,
    applicableTypes: ["company_profile", "ads_commercial", "animation_video"],
  },
  {
    id: "concept_ownership",
    question: "Client udah punya konsep atau terserah?",
    description: "Apakah kamu yang develop konsep dari nol atau tinggal execute?",
    weight: 1.2,
  },
  {
    id: "location",
    question: "Dalam kota / luar kota?",
    description: "Lokasi shooting dan biaya logistik",
    weight: 1.15,
  },
];
