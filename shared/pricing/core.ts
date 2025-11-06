import { DEFAULT_CONTINGENCY_PCT, SKILL_MULTIPLIERS } from "./constants";
import { calculateComplexityMultiplier } from "./complexity";
import type {
  CrewLineInput,
  CrewLineOutput,
  GearLineInput,
  GearLineOutput,
  QuoteInput,
  QuoteOutput,
} from "./types";

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normaliseLine<T extends CrewLineInput | GearLineInput>(
  line: T,
): CrewLineOutput | GearLineOutput {
  const { qty, days, ratePerDay } = line;
  const lineTotal = roundCurrency(qty * days * ratePerDay);
  return { ...line, lineTotal };
}

function sumLines(lines: Array<CrewLineOutput | GearLineOutput>): number {
  return roundCurrency(
    lines.reduce((total, line) => total + line.lineTotal, 0),
  );
}

function sumOOP(
  oop: QuoteInput["oop"],
): { total: number; transport: number; fnb: number; misc: number } {
  const transport = roundCurrency(oop?.transport ?? 0);
  const fnb = roundCurrency(oop?.fnb ?? 0);
  const misc = roundCurrency(oop?.misc ?? 0);
  const total = roundCurrency(transport + fnb + misc);
  return { total, transport, fnb, misc };
}

export function calculateQuote(input: QuoteInput): QuoteOutput {
  const development = input.crew.map((line) =>
    normaliseLine<CrewLineInput>(line),
  ) as CrewLineOutput[];
  const production = input.gear.map((line) =>
    normaliseLine<GearLineInput>(line),
  ) as GearLineOutput[];

  const baseCrew = sumLines(development);
  const baseGear = sumLines(production);
  const oop = sumOOP(input.oop);
  const baseCost = roundCurrency(baseCrew + baseGear + oop.total);

  const complexityFromInput =
    input.complexity.multiplier && input.complexity.weightedScore
      ? {
          weightedScore: input.complexity.weightedScore,
          multiplier: input.complexity.multiplier,
        }
      : calculateComplexityMultiplier(
          input.projectType,
          input.complexity.answers,
        );

  const skillMultiplier = input.business?.skillLevel
    ? SKILL_MULTIPLIERS[input.business.skillLevel]
    : 1;

  const subtotal = roundCurrency(
    baseCost * complexityFromInput.multiplier * skillMultiplier,
  );

  const contingencyPct =
    input.contingencyPct ?? DEFAULT_CONTINGENCY_PCT;
  const contingency = roundCurrency(subtotal * contingencyPct);
  const grandTotal = roundCurrency(subtotal + contingency);

  const profitMarginPct = input.business?.profitMarginPct;
  const clientPrice =
    profitMarginPct !== undefined
      ? roundCurrency(grandTotal * (1 + profitMarginPct))
      : undefined;
  const nettProfit =
    profitMarginPct !== undefined && clientPrice !== undefined
      ? roundCurrency(clientPrice - grandTotal)
      : undefined;

  return {
    projectType: input.projectType,
    baseCrew,
    baseGear,
    baseOOP: oop.total,
    baseCost,
    complexity: {
      weightedScore: roundCurrency(complexityFromInput.weightedScore),
      multiplier: roundCurrency(complexityFromInput.multiplier),
    },
    skillMultiplier: roundCurrency(skillMultiplier),
    subtotal,
    contingencyPct,
    contingency,
    grandTotal,
    profitMarginPct,
    clientPrice,
    nettProfit,
    breakdown: {
      development,
      production,
    },
  };
}
