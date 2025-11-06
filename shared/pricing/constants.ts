import type { SkillLevel } from "./types";

export const DEFAULT_CONTINGENCY_PCT = 0.05;

export const SKILL_MULTIPLIERS: Record<SkillLevel, number> = {
  beginner: 0.95,
  intermediate: 1.0,
  pro: 1.15,
};
