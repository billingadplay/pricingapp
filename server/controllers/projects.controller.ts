import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { calculateQuote } from "../../shared/pricing";
import {
  insertProjectWithDetails,
  fetchProjectById,
  listProjects as listProjectsFromStore,
  type ProjectRecord,
} from "../services/storage";
import {
  projectCreateRequestSchema,
  projectCreateResponseSchema,
  projectResponseSchema,
  projectListResponseSchema,
  projectListItemSchema,
} from "../validators/projects";
import { quoteBreakdownSchema } from "../validators/quote";
import type { QuoteInputPayload } from "../validators/common";

function toQuoteInput(payload: QuoteInputPayload) {
  return {
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
  };
}

function mapProjectRecord(record: ProjectRecord) {
  return {
    id: record.id,
    type: record.type,
    basic: {
      durationMin: record.durationMin,
      deliveryDays: record.deliveryDays,
      flags: record.flags ?? {},
      outputs: record.outputs ?? {},
      brief: record.brief ?? undefined,
    },
    crew: record.crew,
    gear: record.gear,
    oop: {
      transport: record.oop.transport,
      fnb: record.oop.fnb,
      misc: record.oop.misc,
    },
    complexity: {
      answers: record.complexity.answers,
      weightedScore: record.complexity.weightedScore,
      multiplier: record.complexity.multiplier,
    },
    business: record.business,
    pricing: record.pricing,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const payload = projectCreateRequestSchema.parse(req.body);
    const quoteResult = quoteBreakdownSchema.parse(
      calculateQuote(toQuoteInput(payload)),
    );

    const { id } = await insertProjectWithDetails({
      type: payload.projectType,
      durationMin: payload.basic.durationMin,
      deliveryDays: payload.basic.deliveryDays,
      flags: payload.basic.flags,
      outputs: payload.basic.outputs,
      brief: payload.basic.brief,
      crew: quoteResult.breakdown.development.map((line) => ({
        role: line.role,
        qty: line.qty,
        days: line.days,
        ratePerDay: line.ratePerDay,
        lineTotal: line.lineTotal,
      })),
      gear: quoteResult.breakdown.production.map((line) => ({
        name: line.name,
        qty: line.qty,
        days: line.days,
        ratePerDay: line.ratePerDay,
        lineTotal: line.lineTotal,
      })),
      oop: {
        transport: payload.oop?.transport,
        fnb: payload.oop?.fnb,
        misc: payload.oop?.misc,
      },
      complexity: {
        answers: payload.complexity.answers,
        weightedScore: quoteResult.complexity.weightedScore,
        multiplier: quoteResult.complexity.multiplier,
      },
      business: payload.business
        ? {
            incomeGoal: payload.business.incomeGoal,
            livingCost: payload.business.livingCost,
            skillLevel: payload.business.skillLevel,
            profitMarginPct: payload.business.profitMarginPct,
          }
        : undefined,
      pricing: {
        baseCrew: quoteResult.baseCrew,
        baseGear: quoteResult.baseGear,
        baseOOP: quoteResult.baseOOP,
        baseCost: quoteResult.baseCost,
        subtotal: quoteResult.subtotal,
        contingencyPct: quoteResult.contingencyPct,
        contingency: quoteResult.contingency,
        grandTotal: quoteResult.grandTotal,
        profitMarginPct: quoteResult.profitMarginPct,
        clientPrice: quoteResult.clientPrice,
        nettProfit: quoteResult.nettProfit,
      },
    });

    res
      .status(201)
      .json(
        projectCreateResponseSchema.parse({
          id,
        }),
      );
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

export async function getProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const project = await fetchProjectById(req.params.id);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const response = projectResponseSchema.parse(mapProjectRecord(project));
    res.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(500).json({
        error: "Failed to parse project",
        details: error.errors,
      });
      return;
    }
    next(error);
  }
}

export async function listProjects(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const records = await listProjectsFromStore(50);
    const items = records.map((record: ProjectRecord) =>
      projectListItemSchema.parse({
        id: record.id,
        type: record.type,
        basic: {
          durationMin: record.durationMin,
          deliveryDays: record.deliveryDays,
          flags: record.flags ?? {},
          outputs: record.outputs ?? {},
          brief: record.brief ?? undefined,
        },
        pricing: record.pricing,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      }),
    );

    res.json(projectListResponseSchema.parse({ items }));
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(500).json({
        error: "Failed to parse projects list",
        details: error.errors,
      });
      return;
    }
    next(error);
  }
}
