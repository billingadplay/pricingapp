import { z } from "zod";
import {
  crewLineSchema,
  gearLineSchema,
  quoteInputSchema,
} from "./common";
import { PROJECT_TYPES } from "../../shared/pricing";

export const quotePreviewRequestSchema = quoteInputSchema;

export const quoteBreakdownSchema = z.object({
  projectType: z.enum(PROJECT_TYPES),
  baseCrew: z.number(),
  baseGear: z.number(),
  baseOOP: z.number(),
  baseCost: z.number(),
  complexity: z.object({
    weightedScore: z.number(),
    multiplier: z.number(),
  }),
  skillMultiplier: z.number(),
  subtotal: z.number(),
  contingencyPct: z.number(),
  contingency: z.number(),
  grandTotal: z.number(),
  profitMarginPct: z.number().optional(),
  clientPrice: z.number().optional(),
  nettProfit: z.number().optional(),
  breakdown: z.object({
    development: z.array(
      crewLineSchema.extend({
        lineTotal: z.number(),
      }),
    ),
    production: z.array(
      gearLineSchema.extend({
        lineTotal: z.number(),
      }),
    ),
  }),
});

export type QuotePreviewResponse = z.infer<typeof quoteBreakdownSchema>;
