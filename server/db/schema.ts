import { sql } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  numeric,
  timestamp,
  smallint,
  bigserial,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projectTypeEnum = pgEnum("project_type", [
  "company_profile",
  "ads",
  "fashion",
  "event",
  "social",
  "animation",
]);

export const skillLevelEnum = pgEnum("skill_level", [
  "beginner",
  "intermediate",
  "pro",
]);

// NOTE: line_category enum is defined in the spec but not used directly yet.
export const lineCategoryEnum = pgEnum("line_category", [
  "development",
  "production",
  "expense",
]);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: projectTypeEnum("type").notNull(),
    durationMin: integer("duration_min").notNull(),
    deliveryDays: integer("delivery_days").notNull(),
    flags: jsonb("flags")
      .$type<{
        animations?: boolean;
        voiceover?: boolean;
        sfx?: boolean;
      }>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    outputs: jsonb("outputs")
      .$type<{
        portrait?: boolean;
        cut15?: boolean;
        cut30?: boolean;
        cut60?: boolean;
      }>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    brief: text("brief"),
    baseCrew: numeric("base_crew", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    baseGear: numeric("base_gear", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    baseOop: numeric("base_oop", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    baseCost: numeric("base_cost", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    contingencyPct: numeric("contingency_pct", { precision: 5, scale: 4 })
      .notNull()
      .default("0.05"),
    contingencyValue: numeric("contingency_value", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),
    grandTotal: numeric("grand_total", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    profitMarginPct: numeric("profit_margin_pct", {
      precision: 5,
      scale: 4,
    }),
    clientPrice: numeric("client_price", { precision: 12, scale: 2 }),
    nettProfit: numeric("nett_profit", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    typeCreatedAtIdx: index("idx_projects_type_created_at").on(
      table.type,
      table.createdAt,
    ),
  }),
);

export const projectCrewLines = pgTable("project_crew_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  role: text("role").notNull(),
  qty: numeric("qty", { precision: 6, scale: 2 }).notNull().default("1"),
  days: numeric("days", { precision: 6, scale: 2 }).notNull().default("1"),
  ratePerDay: numeric("rate_per_day", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const projectGearLines = pgTable("project_gear_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  name: text("name").notNull(),
  qty: numeric("qty", { precision: 6, scale: 2 }).notNull().default("1"),
  days: numeric("days", { precision: 6, scale: 2 }).notNull().default("1"),
  ratePerDay: numeric("rate_per_day", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const projectExpenseLines = pgTable("project_expense_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const projectComplexities = pgTable(
  "project_complexities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    answers: smallint("answers")
      .array()
      .notNull(), // TODO: enforce cardinality == 10 via database constraint.
    weightedScore: numeric("weighted_score", { precision: 6, scale: 2 }).notNull(),
    multiplier: numeric("multiplier", { precision: 6, scale: 3 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    projectIdx: index("idx_project_complexities_project").on(table.projectId),
  }),
);

export const projectBusinessOverrides = pgTable("project_business_overrides", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  incomeGoal: numeric("income_goal", { precision: 12, scale: 2 }),
  livingCost: numeric("living_cost", { precision: 12, scale: 2 }),
  skill: skillLevelEnum("skill").notNull(),
  incomeMultiplier: numeric("income_multiplier", {
    precision: 6,
    scale: 3,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const marketSnapshots = pgTable(
  "market_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "set null" }),
    type: projectTypeEnum("type").notNull(),
    durationMin: integer("duration_min").notNull(),
    deliveryDays: integer("delivery_days").notNull(),
    complexityScore: numeric("complexity_score", { precision: 6, scale: 2 }).notNull(),
    baseCost: numeric("base_cost", { precision: 12, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
    clientPrice: numeric("client_price", { precision: 12, scale: 2 }),
    capturedAt: timestamp("captured_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    typeIdx: index("idx_market_snapshots_type").on(table.type, table.capturedAt),
  }),
);

export const templateConfigs = pgTable(
  "template_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: projectTypeEnum("type").notNull().unique(),
    label: text("label").notNull(),
    contingencyPct: numeric("contingency_pct", { precision: 5, scale: 4 })
      .notNull()
      .default("0.05"),
    skillDefaults: jsonb("skill_defaults")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    typeUnique: index("uq_template_type").on(table.type),
  }),
);

export const templateCrewLines = pgTable("template_crew_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => templateConfigs.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  role: text("role").notNull(),
  qty: numeric("qty", { precision: 6, scale: 2 }).notNull().default("1"),
  days: numeric("days", { precision: 6, scale: 2 }).notNull().default("1"),
  ratePerDay: numeric("rate_per_day", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const templateGearLines = pgTable("template_gear_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => templateConfigs.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  name: text("name").notNull(),
  qty: numeric("qty", { precision: 6, scale: 2 }).notNull().default("1"),
  days: numeric("days", { precision: 6, scale: 2 }).notNull().default("1"),
  ratePerDay: numeric("rate_per_day", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const templateComplexityWeights = pgTable(
  "template_complexity_weights",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templateConfigs.id, { onDelete: "cascade" }),
    questionIndex: smallint("question_index").notNull(),
    weight: numeric("weight", { precision: 6, scale: 4 }).notNull(),
  },
  (table) => ({
    templateQuestionUnique: index("uq_template_question").on(
      table.templateId,
      table.questionIndex,
    ),
  }),
);

export const templateRules = pgTable("template_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => templateConfigs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  trigger: jsonb("trigger").notNull(),
  action: jsonb("action").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  namespace: text("namespace").notNull(),
  entityId: uuid("entity_id"),
  action: text("action").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const jobRuns = pgTable("job_runs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  jobName: text("job_name").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status").notNull(),
  metadata: jsonb("metadata"),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type ProjectCrewLine = typeof projectCrewLines.$inferSelect;
export type ProjectGearLine = typeof projectGearLines.$inferSelect;
export type ProjectExpenseLine = typeof projectExpenseLines.$inferSelect;
export type ProjectComplexity = typeof projectComplexities.$inferSelect;
export type ProjectBusinessOverride =
  typeof projectBusinessOverrides.$inferSelect;

export type MarketSnapshot = typeof marketSnapshots.$inferSelect;
export type InsertMarketSnapshot = typeof marketSnapshots.$inferInsert;
export type MarketBenchmark = MarketSnapshot;
export type InsertMarketBenchmark = InsertMarketSnapshot;

export type TemplateConfig = typeof templateConfigs.$inferSelect;
export type TemplateCrewLine = typeof templateCrewLines.$inferSelect;
export type TemplateGearLine = typeof templateGearLines.$inferSelect;
export type TemplateComplexityWeight =
  typeof templateComplexityWeights.$inferSelect;
export type TemplateRule = typeof templateRules.$inferSelect;

export type ProjectType = (typeof projectTypeEnum.enumValues)[number];
export type SkillLevel = (typeof skillLevelEnum.enumValues)[number];

export const insertProjectSchema = createInsertSchema(projects, {
  type: z.enum(projectTypeEnum.enumValues),
  flags: z
    .object({
      animations: z.boolean().optional(),
      voiceover: z.boolean().optional(),
      sfx: z.boolean().optional(),
    })
    .partial()
    .default({}),
  outputs: z
    .object({
      portrait: z.boolean().optional(),
      cut15: z.boolean().optional(),
      cut30: z.boolean().optional(),
      cut60: z.boolean().optional(),
    })
    .partial()
    .default({}),
  contingencyPct: z.coerce
    .number()
    .min(0)
    .default(0.05),
  contingencyValue: z.coerce.number().min(0).default(0),
  baseCrew: z.coerce.number().min(0).default(0),
  baseGear: z.coerce.number().min(0).default(0),
  baseOop: z.coerce.number().min(0).default(0),
  baseCost: z.coerce.number().min(0).default(0),
  subtotal: z.coerce.number().min(0).default(0),
  grandTotal: z.coerce.number().min(0).default(0),
  profitMarginPct: z.coerce.number().optional(),
  clientPrice: z.coerce.number().optional(),
  nettProfit: z.coerce.number().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketSnapshotSchema = createInsertSchema(marketSnapshots, {
  type: z.enum(projectTypeEnum.enumValues),
  complexityScore: z.coerce.number(),
  baseCost: z.coerce.number(),
  subtotal: z.coerce.number(),
  grandTotal: z.coerce.number(),
  clientPrice: z.coerce.number().optional(),
}).omit({
  id: true,
  capturedAt: true,
});
