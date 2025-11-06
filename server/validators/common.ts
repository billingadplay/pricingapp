import { z } from "zod";
import { PROJECT_TYPES, SKILL_LEVELS } from "../../shared/pricing";

export const flagsSchema = z
  .object({
    animations: z.boolean().optional(),
    voiceover: z.boolean().optional(),
    sfx: z.boolean().optional(),
  })
  .partial()
  .default({});

export const outputsSchema = z
  .object({
    portrait: z.boolean().optional(),
    cut15: z.boolean().optional(),
    cut30: z.boolean().optional(),
    cut60: z.boolean().optional(),
  })
  .partial()
  .default({});

export const basicInfoSchema = z.object({
  durationMin: z.number().int().positive(),
  deliveryDays: z.number().int().positive(),
  flags: flagsSchema,
  outputs: outputsSchema,
  brief: z.string().max(5000).optional(),
});

export const crewLineSchema = z.object({
  role: z.string().min(1),
  qty: z.number().positive(),
  days: z.number().positive(),
  ratePerDay: z.number().min(0),
});

export const gearLineSchema = z.object({
  name: z.string().min(1),
  qty: z.number().positive(),
  days: z.number().positive(),
  ratePerDay: z.number().min(0),
});

export const oopSchema = z
  .object({
    transport: z.number().min(0).optional(),
    fnb: z.number().min(0).optional(),
    misc: z.number().min(0).optional(),
  })
  .partial()
  .optional();

export const complexitySchema = z.object({
  answers: z.array(z.number().min(0).max(5)).length(10),
});

export const businessSchema = z
  .object({
    incomeGoal: z.number().min(0).optional(),
    livingCost: z.number().min(0).optional(),
    skillLevel: z.enum(SKILL_LEVELS),
    profitMarginPct: z.number().min(0).max(1).optional(),
  })
  .optional();

export const quoteInputSchema = z.object({
  projectType: z.enum(PROJECT_TYPES),
  basic: basicInfoSchema,
  crew: z.array(crewLineSchema).min(1),
  gear: z.array(gearLineSchema).default([]),
  oop: oopSchema,
  complexity: complexitySchema,
  business: businessSchema,
  contingencyPct: z.number().min(0).max(1).optional(),
});

export type QuoteInputPayload = z.infer<typeof quoteInputSchema>;
