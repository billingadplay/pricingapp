import { describe, it, expect } from "vitest";
import { calculateQuote } from "./core";
import {
  calculateComplexityMultiplier,
  getComplexityWeights,
} from "./complexity";
import {
  DEFAULT_CONTINGENCY_PCT,
  SKILL_MULTIPLIERS,
} from "./constants";
import type { ProjectType, QuoteInput } from "./types";

const ANSWERS: Record<ProjectType, number[]> = {
  company_profile: [2, 3, 2, 1, 3, 2, 1, 2, 2, 1],
  ads: [3, 4, 3, 2, 3, 4, 2, 2, 1, 2],
  fashion: [2, 4, 3, 2, 3, 3, 2, 3, 2, 2],
  event: [1, 2, 3, 3, 2, 3, 2, 2, 3, 3],
  social: [2, 2, 3, 1, 3, 2, 2, 1, 3, 2],
  animation: [3, 4, 4, 3, 3, 3, 2, 3, 3, 3],
};

const SKILL_SEQUENCE: Record<ProjectType, "beginner" | "intermediate" | "pro"> =
  {
    company_profile: "beginner",
    ads: "intermediate",
    fashion: "pro",
    event: "intermediate",
    social: "beginner",
    animation: "pro",
  };

function buildInput(projectType: ProjectType): QuoteInput {
  return {
    projectType,
    crew: [
      { role: "Lead", qty: 1, days: 1, ratePerDay: 1_000_000 },
      { role: "Support", qty: 2, days: 0.5, ratePerDay: 400_000 },
    ],
    gear: [{ name: "Kit", qty: 1, days: 1, ratePerDay: 250_000 }],
    oop: { transport: 150_000, fnb: 50_000 },
    complexity: { answers: ANSWERS[projectType] },
    business: {
      skillLevel: SKILL_SEQUENCE[projectType],
      profitMarginPct: 0.1,
    },
  };
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

describe("calculateQuote", () => {
  (Object.keys(ANSWERS) as ProjectType[]).forEach((projectType) => {
    it(`calculates totals for ${projectType}`, () => {
      // ensure weights are defined
      expect(getComplexityWeights(projectType)).toHaveLength(10);

      const input = buildInput(projectType);
      const result = calculateQuote(input);

      const crewTotal = round(
        1 * 1 * 1_000_000 + 2 * 0.5 * 400_000,
      );
      const gearTotal = round(1 * 1 * 250_000);
      const oopTotal = round(150_000 + 50_000);
      const baseCost = round(crewTotal + gearTotal + oopTotal);

      const complexity = calculateComplexityMultiplier(
        projectType,
        ANSWERS[projectType],
      );
      const skill = SKILL_MULTIPLIERS[SKILL_SEQUENCE[projectType]];

      const expectedSubtotal = round(
        baseCost * complexity.multiplier * skill,
      );
      const contingencyPct = DEFAULT_CONTINGENCY_PCT;
      const expectedContingency = round(expectedSubtotal * contingencyPct);
      const expectedGrand = round(expectedSubtotal + expectedContingency);
      const expectedClient = round(expectedGrand * 1.1);
      const expectedProfit = round(expectedClient - expectedGrand);

      expect(result.baseCrew).toBe(crewTotal);
      expect(result.baseGear).toBe(gearTotal);
      expect(result.baseOOP).toBe(oopTotal);
      expect(result.baseCost).toBe(baseCost);

      expect(result.complexity.multiplier).toBe(
        round(complexity.multiplier),
      );
      expect(result.skillMultiplier).toBe(round(skill));

      expect(result.subtotal).toBe(expectedSubtotal);
      expect(result.contingencyPct).toBe(contingencyPct);
      expect(result.contingency).toBe(expectedContingency);
      expect(result.grandTotal).toBe(expectedGrand);
      expect(result.clientPrice).toBe(expectedClient);
      expect(result.nettProfit).toBe(expectedProfit);

      expect(result.breakdown.development).toHaveLength(2);
      expect(result.breakdown.production).toHaveLength(1);
    });
  });
});
