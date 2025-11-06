import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { calculateQuote } from "../../shared/pricing";
import {
  quotePreviewRequestSchema,
  quoteBreakdownSchema,
} from "../validators/quote";

export async function previewQuote(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const payload = quotePreviewRequestSchema.parse(req.body);

    const quote = calculateQuote({
      projectType: payload.projectType,
      crew: payload.crew,
      gear: payload.gear,
      oop: payload.oop ?? {},
      complexity: payload.complexity,
      business: payload.business
        ? {
            incomeGoal: payload.business.incomeGoal,
            livingCost: payload.business.livingCost,
            skillLevel: payload.business.skillLevel,
            profitMarginPct: payload.business.profitMarginPct,
          }
        : undefined,
      contingencyPct: payload.contingencyPct,
    });

    const response = quoteBreakdownSchema.parse(quote);
    res.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
      return;
    }
    next(error);
  }
}
