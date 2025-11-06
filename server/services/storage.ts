import {
  asc,
  desc,
  eq,
  inArray,
} from "drizzle-orm";
import { db } from "../db/client";
import {
  projects,
  projectCrewLines,
  projectGearLines,
  projectExpenseLines,
  projectComplexities,
  projectBusinessOverrides,
} from "../db/schema";
import type {
  ProjectType,
  SkillLevel,
} from "../../shared/pricing";

type CrewLine = {
  role: string;
  qty: number;
  days: number;
  ratePerDay: number;
  lineTotal: number;
};

type GearLine = {
  name: string;
  qty: number;
  days: number;
  ratePerDay: number;
  lineTotal: number;
};

type OOPDetail = {
  transport?: number;
  fnb?: number;
  misc?: number;
};

type ComplexityDetail = {
  answers: number[];
  weightedScore: number;
  multiplier: number;
};

type BusinessDetail = {
  incomeGoal?: number;
  livingCost?: number;
  skillLevel: SkillLevel;
  profitMarginPct?: number;
};

export type CreateProjectRecord = {
  type: ProjectType;
  durationMin: number;
  deliveryDays: number;
  flags: Record<string, boolean | undefined>;
  outputs: Record<string, boolean | undefined>;
  brief?: string;
  crew: CrewLine[];
  gear: GearLine[];
  oop: OOPDetail;
  complexity: ComplexityDetail;
  business?: BusinessDetail;
  pricing: {
    baseCrew: number;
    baseGear: number;
    baseOOP: number;
    baseCost: number;
    subtotal: number;
    contingencyPct: number;
    contingency: number;
    grandTotal: number;
    profitMarginPct?: number;
    clientPrice?: number;
    nettProfit?: number;
  };
};

export type ProjectRecord = {
  id: string;
  type: ProjectType;
  durationMin: number;
  deliveryDays: number;
  flags: Record<string, boolean | undefined>;
  outputs: Record<string, boolean | undefined>;
  brief?: string | null;
  crew: CrewLine[];
  gear: GearLine[];
  oop: OOPDetail;
  complexity: ComplexityDetail;
  business?: Partial<BusinessDetail>;
  pricing: CreateProjectRecord["pricing"];
  createdAt: string;
  updatedAt: string;
};

function toDecimal(value: number, fractionDigits = 2): string {
  return value.toFixed(fractionDigits);
}

function fromNumeric(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normaliseAnswers(values?: number[]): number[] {
  const fallback = Array.from({ length: 10 }, () => 0);
  if (!values) {
    return fallback;
  }
  if (values.length === 10) {
    return values.map((value) => Number(value));
  }
  const result = fallback.slice();
  values.slice(0, 10).forEach((value, index) => {
    result[index] = Number(value);
  });
  return result;
}

export async function insertProjectWithDetails(
  payload: CreateProjectRecord,
): Promise<{ id: string }> {
  const now = new Date();
  const result = await db.transaction(async (tx) => {
    const [projectRow] = await tx
      .insert(projects)
      .values({
        type: payload.type,
        durationMin: payload.durationMin,
        deliveryDays: payload.deliveryDays,
        flags: payload.flags,
        outputs: payload.outputs,
        brief: payload.brief,
        baseCrew: toDecimal(payload.pricing.baseCrew),
        baseGear: toDecimal(payload.pricing.baseGear),
        baseOop: toDecimal(payload.pricing.baseOOP),
        baseCost: toDecimal(payload.pricing.baseCost),
        subtotal: toDecimal(payload.pricing.subtotal),
        contingencyPct: toDecimal(payload.pricing.contingencyPct, 4),
        contingencyValue: toDecimal(payload.pricing.contingency),
        grandTotal: toDecimal(payload.pricing.grandTotal),
        profitMarginPct:
          payload.pricing.profitMarginPct !== undefined
            ? toDecimal(payload.pricing.profitMarginPct, 4)
            : undefined,
        clientPrice:
          payload.pricing.clientPrice !== undefined
            ? toDecimal(payload.pricing.clientPrice)
            : undefined,
        nettProfit:
          payload.pricing.nettProfit !== undefined
            ? toDecimal(payload.pricing.nettProfit)
            : undefined,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const projectId = projectRow.id;

    if (payload.crew.length > 0) {
      await tx.insert(projectCrewLines).values(
        payload.crew.map((line, index) => ({
          projectId,
          sortOrder: index,
          role: line.role,
          qty: toDecimal(line.qty),
          days: toDecimal(line.days),
          ratePerDay: toDecimal(line.ratePerDay),
          lineTotal: toDecimal(line.lineTotal),
        })),
      );
    }

    if (payload.gear.length > 0) {
      await tx.insert(projectGearLines).values(
        payload.gear.map((line, index) => ({
          projectId,
          sortOrder: index,
          name: line.name,
          qty: toDecimal(line.qty),
          days: toDecimal(line.days),
          ratePerDay: toDecimal(line.ratePerDay),
          lineTotal: toDecimal(line.lineTotal),
        })),
      );
    }

    const expenseEntries: { category: string; amount: number }[] = [];
    if (payload.oop.transport) {
      expenseEntries.push({ category: "transport", amount: payload.oop.transport });
    }
    if (payload.oop.fnb) {
      expenseEntries.push({ category: "fnb", amount: payload.oop.fnb });
    }
    if (payload.oop.misc) {
      expenseEntries.push({ category: "misc", amount: payload.oop.misc });
    }
    if (expenseEntries.length > 0) {
      await tx.insert(projectExpenseLines).values(
        expenseEntries.map((expense) => ({
          projectId,
          category: expense.category,
          amount: toDecimal(expense.amount),
        })),
      );
    }

    await tx.insert(projectComplexities).values({
      projectId,
      answers: payload.complexity.answers.map((value) =>
        Math.max(0, Math.min(5, Math.round(value))),
      ),
      weightedScore: toDecimal(payload.complexity.weightedScore),
      multiplier: toDecimal(payload.complexity.multiplier, 3),
    });

    if (payload.business && payload.business.skillLevel) {
      await tx.insert(projectBusinessOverrides).values({
        projectId,
        incomeGoal:
          payload.business.incomeGoal !== undefined
            ? toDecimal(payload.business.incomeGoal)
            : undefined,
        livingCost:
          payload.business.livingCost !== undefined
            ? toDecimal(payload.business.livingCost)
            : undefined,
        skill: payload.business.skillLevel,
        incomeMultiplier: undefined,
      });
    }

    return projectRow;
  });

  return { id: result.id };
}

function mapCrewLine(row: typeof projectCrewLines.$inferSelect): CrewLine {
  return {
    role: row.role,
    qty: fromNumeric(row.qty),
    days: fromNumeric(row.days),
    ratePerDay: fromNumeric(row.ratePerDay),
    lineTotal: fromNumeric(row.lineTotal),
  };
}

function mapGearLine(row: typeof projectGearLines.$inferSelect): GearLine {
  return {
    name: row.name,
    qty: fromNumeric(row.qty),
    days: fromNumeric(row.days),
    ratePerDay: fromNumeric(row.ratePerDay),
    lineTotal: fromNumeric(row.lineTotal),
  };
}

function mapOOP(
  rows: typeof projectExpenseLines.$inferSelect[],
): OOPDetail {
  const detail: OOPDetail = {};
  for (const expense of rows) {
    const amount = fromNumeric(expense.amount);
    if (expense.category === "transport") {
      detail.transport = amount;
    } else if (expense.category === "fnb") {
      detail.fnb = amount;
    } else if (expense.category === "misc") {
      detail.misc = amount;
    }
  }
  return detail;
}

export async function fetchProjectById(
  id: string,
): Promise<ProjectRecord | undefined> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) {
    return undefined;
  }

  const [crew, gear, expenses, complexity, business] = await Promise.all([
    db
      .select()
      .from(projectCrewLines)
      .where(eq(projectCrewLines.projectId, id))
      .orderBy(asc(projectCrewLines.sortOrder)),
    db
      .select()
      .from(projectGearLines)
      .where(eq(projectGearLines.projectId, id))
      .orderBy(asc(projectGearLines.sortOrder)),
    db
      .select()
      .from(projectExpenseLines)
      .where(eq(projectExpenseLines.projectId, id)),
    db
      .select()
      .from(projectComplexities)
      .where(eq(projectComplexities.projectId, id))
      .limit(1),
    db
      .select()
      .from(projectBusinessOverrides)
      .where(eq(projectBusinessOverrides.projectId, id))
      .limit(1),
  ]);

  const parsedBusiness = business[0]
    ? {
        incomeGoal:
          business[0].incomeGoal !== null && business[0].incomeGoal !== undefined
            ? fromNumeric(business[0].incomeGoal)
            : undefined,
        livingCost:
          business[0].livingCost !== null && business[0].livingCost !== undefined
            ? fromNumeric(business[0].livingCost)
            : undefined,
        skillLevel: business[0].skill,
      }
    : undefined;
  const profitMarginPct =
    project.profitMarginPct !== null && project.profitMarginPct !== undefined
      ? fromNumeric(project.profitMarginPct)
      : undefined;

  return {
    id: project.id,
    type: project.type,
    durationMin: project.durationMin,
    deliveryDays: project.deliveryDays,
    flags: project.flags ?? {},
    outputs: project.outputs ?? {},
    brief: project.brief,
    crew: crew.map(mapCrewLine),
    gear: gear.map(mapGearLine),
    oop: mapOOP(expenses),
    complexity: {
      answers: normaliseAnswers(complexity[0]?.answers),
      weightedScore: complexity[0]
        ? fromNumeric(complexity[0].weightedScore)
        : 0,
      multiplier: complexity[0]
        ? fromNumeric(complexity[0].multiplier)
        : 1,
    },
    business:
      parsedBusiness || profitMarginPct !== undefined
        ? { ...parsedBusiness, profitMarginPct }
        : undefined,
    pricing: {
      baseCrew: fromNumeric(project.baseCrew),
      baseGear: fromNumeric(project.baseGear),
      baseOOP: fromNumeric(project.baseOop),
      baseCost: fromNumeric(project.baseCost),
      subtotal: fromNumeric(project.subtotal),
      contingencyPct: fromNumeric(project.contingencyPct),
      contingency: fromNumeric(project.contingencyValue),
      grandTotal: fromNumeric(project.grandTotal),
      profitMarginPct,
      clientPrice:
        project.clientPrice !== null && project.clientPrice !== undefined
          ? fromNumeric(project.clientPrice)
          : undefined,
      nettProfit:
        project.nettProfit !== null && project.nettProfit !== undefined
          ? fromNumeric(project.nettProfit)
          : undefined,
    },
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export async function listProjects(
  limit = 50,
): Promise<ProjectRecord[]> {
  const rows = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt))
    .limit(limit);

  if (rows.length === 0) {
    return [];
  }

  const projectIds = rows.map((row) => row.id);
  const [crew, gear, expenses, complexities, businesses] = await Promise.all([
    db
      .select()
      .from(projectCrewLines)
      .where(inArray(projectCrewLines.projectId, projectIds))
      .orderBy(asc(projectCrewLines.projectId), asc(projectCrewLines.sortOrder)),
    db
      .select()
      .from(projectGearLines)
      .where(inArray(projectGearLines.projectId, projectIds))
      .orderBy(asc(projectGearLines.projectId), asc(projectGearLines.sortOrder)),
    db
      .select()
      .from(projectExpenseLines)
      .where(inArray(projectExpenseLines.projectId, projectIds)),
    db
      .select()
      .from(projectComplexities)
      .where(inArray(projectComplexities.projectId, projectIds)),
    db
      .select()
      .from(projectBusinessOverrides)
      .where(inArray(projectBusinessOverrides.projectId, projectIds)),
  ]);

  return rows.map((row) => {
    const crewLines = crew
      .filter((line) => line.projectId === row.id)
      .map(mapCrewLine);
    const gearLines = gear
      .filter((line) => line.projectId === row.id)
      .map(mapGearLine);
    const expenseLines = expenses.filter(
      (expense) => expense.projectId === row.id,
    );
    const complexity = complexities.find(
      (item) => item.projectId === row.id,
    );
    const business = businesses.find(
      (item) => item.projectId === row.id,
    );

    const profitMarginPct =
      row.profitMarginPct !== null && row.profitMarginPct !== undefined
        ? fromNumeric(row.profitMarginPct)
        : undefined;

    const businessDetail = business
      ? {
          incomeGoal:
            business.incomeGoal !== null && business.incomeGoal !== undefined
              ? fromNumeric(business.incomeGoal)
              : undefined,
          livingCost:
            business.livingCost !== null && business.livingCost !== undefined
              ? fromNumeric(business.livingCost)
              : undefined,
          skillLevel: business.skill,
        }
      : undefined;

    return {
      id: row.id,
      type: row.type,
      durationMin: row.durationMin,
      deliveryDays: row.deliveryDays,
      flags: row.flags ?? {},
      outputs: row.outputs ?? {},
      brief: row.brief,
      crew: crewLines,
      gear: gearLines,
      oop: mapOOP(expenseLines),
      complexity: {
        answers: normaliseAnswers(complexity?.answers),
        weightedScore: complexity
          ? fromNumeric(complexity.weightedScore)
          : 0,
        multiplier: complexity ? fromNumeric(complexity.multiplier) : 1,
      },
      business:
        businessDetail || profitMarginPct !== undefined
          ? { ...businessDetail, profitMarginPct }
          : undefined,
      pricing: {
        baseCrew: fromNumeric(row.baseCrew),
        baseGear: fromNumeric(row.baseGear),
        baseOOP: fromNumeric(row.baseOop),
        baseCost: fromNumeric(row.baseCost),
        subtotal: fromNumeric(row.subtotal),
        contingencyPct: fromNumeric(row.contingencyPct),
        contingency: fromNumeric(row.contingencyValue),
        grandTotal: fromNumeric(row.grandTotal),
        profitMarginPct,
        clientPrice:
          row.clientPrice !== null && row.clientPrice !== undefined
            ? fromNumeric(row.clientPrice)
            : undefined,
        nettProfit:
          row.nettProfit !== null && row.nettProfit !== undefined
            ? fromNumeric(row.nettProfit)
            : undefined,
      },
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  });
}
