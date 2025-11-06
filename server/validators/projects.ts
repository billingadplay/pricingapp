import { z } from "zod";
import {
  basicInfoSchema,
  crewLineSchema,
  gearLineSchema,
  quoteInputSchema,
} from "./common";
import { PROJECT_TYPES, SKILL_LEVELS } from "../../shared/pricing";
import { quoteBreakdownSchema } from "./quote";

export const projectCreateRequestSchema = quoteInputSchema.extend({
  meta: z
    .object({
      projectTitle: z.string().optional(),
      clientName: z.string().optional(),
    })
    .optional(),
});

export const projectIdentifierSchema = z.object({
  id: z.string().uuid(),
});

export const oopDetailSchema = z.object({
  transport: z.number().optional(),
  fnb: z.number().optional(),
  misc: z.number().optional(),
});

export const complexityDetailSchema = z.object({
  answers: z.array(z.number()).length(10),
  weightedScore: z.number(),
  multiplier: z.number(),
});

export const businessDetailSchema = z
  .object({
    incomeGoal: z.number().optional(),
    livingCost: z.number().optional(),
    skillLevel: z.enum(SKILL_LEVELS).optional(),
    profitMarginPct: z.number().optional(),
  })
  .partial();

export const projectResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(PROJECT_TYPES),
  meta: z
    .object({
      projectTitle: z.string().nullable().optional(),
      clientName: z.string().nullable().optional(),
    })
    .optional(),
  basic: basicInfoSchema,
  crew: z.array(
    crewLineSchema.extend({
      lineTotal: z.number(),
    }),
  ),
  gear: z.array(
    gearLineSchema.extend({
      lineTotal: z.number(),
    }),
  ),
  oop: oopDetailSchema,
  complexity: complexityDetailSchema,
  business: businessDetailSchema.optional(),
  pricing: z.object({
    baseCrew: z.number(),
    baseGear: z.number(),
    baseOOP: z.number(),
    baseCost: z.number(),
    subtotal: z.number(),
    contingencyPct: z.number(),
    contingency: z.number(),
    grandTotal: z.number(),
    profitMarginPct: z.number().optional(),
    clientPrice: z.number().optional(),
    nettProfit: z.number().optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const projectCreateResponseSchema = z.object({
  id: z.string().uuid(),
});

export const projectListItemSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(PROJECT_TYPES),
  basic: basicInfoSchema.pick({
    durationMin: true,
    deliveryDays: true,
    flags: true,
    outputs: true,
    brief: true,
  }),
  pricing: projectResponseSchema.shape.pricing,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const projectListResponseSchema = z.object({
  items: z.array(projectListItemSchema),
});

export type ProjectCreateRequest = z.infer<typeof projectCreateRequestSchema>;
export type ProjectResponse = z.infer<typeof projectResponseSchema>;
export type ProjectListItem = z.infer<typeof projectListItemSchema>;
