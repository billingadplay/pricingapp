export const PROJECT_TYPES = [
  "company_profile",
  "ads",
  "fashion",
  "event",
  "social",
  "animation",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const SKILL_LEVELS = ["beginner", "intermediate", "pro"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export type CrewLineInput = {
  role: string;
  qty: number;
  days: number;
  ratePerDay: number;
};

export type GearLineInput = {
  name: string;
  qty: number;
  days: number;
  ratePerDay: number;
};

export type OOPCosts = {
  transport?: number;
  fnb?: number;
  misc?: number;
};

export type BusinessConstraints = {
  incomeGoal?: number;
  livingCost?: number;
  skillLevel?: SkillLevel;
  profitMarginPct?: number;
};

export type ComplexityInput = {
  answers: number[]; // length 10, scale 0..5
  weightedScore?: number;
  multiplier?: number;
};

export type QuoteInput = {
  projectType: ProjectType;
  crew: CrewLineInput[];
  gear: GearLineInput[];
  oop?: OOPCosts;
  complexity: ComplexityInput;
  business?: BusinessConstraints;
  contingencyPct?: number;
};

export type CrewLineOutput = CrewLineInput & {
  lineTotal: number;
};

export type GearLineOutput = GearLineInput & {
  lineTotal: number;
};

export type QuoteOutput = {
  projectType: ProjectType;
  baseCrew: number;
  baseGear: number;
  baseOOP: number;
  baseCost: number;
  complexity: {
    weightedScore: number;
    multiplier: number;
  };
  skillMultiplier: number;
  subtotal: number;
  contingencyPct: number;
  contingency: number;
  grandTotal: number;
  profitMarginPct?: number;
  clientPrice?: number;
  nettProfit?: number;
  breakdown: {
    development: CrewLineOutput[];
    production: GearLineOutput[];
  };
};

export type TemplateRule = {
  name: string;
  trigger: Record<string, unknown>;
  action: Record<string, unknown>;
};

export type TemplateConfig = {
  type: ProjectType;
  label: string;
  contingencyPct: number;
  skillDefaults: Record<SkillLevel, number>;
  crew: CrewLineInput[];
  gear: GearLineInput[];
  complexityWeights: number[];
  rules: TemplateRule[];
};
