import { TEMPLATE_CONFIGS } from "./templates";
import type { ProjectType } from "./types";

const COMPLEXITY_BANDS = [
  { min: 0, max: 10, minMultiplier: 0.9, maxMultiplier: 1.0 },
  { min: 10, max: 20, multiplier: 1.05 },
  { min: 20, max: 30, multiplier: 1.1 },
  { min: 30, max: 35, multiplier: 1.2 },
  { min: 35, max: 40, minMultiplier: 1.3, maxMultiplier: 1.4 },
] as const;

function clampScore(score: number): number {
  return Math.max(0, Math.min(40, score));
}

function interpolate(
  score: number,
  minScore: number,
  maxScore: number,
  minMultiplier: number,
  maxMultiplier: number,
): number {
  if (maxScore === minScore) {
    return maxMultiplier;
  }
  const ratio = (score - minScore) / (maxScore - minScore);
  return minMultiplier + ratio * (maxMultiplier - minMultiplier);
}

export function getComplexityWeights(type: ProjectType): number[] {
  const weights = TEMPLATE_CONFIGS[type].complexityWeights;
  if (weights.length !== 10) {
    throw new Error(`Complexity weights for ${type} must have 10 entries.`);
  }
  return weights;
}

export function calculateComplexityScore(
  type: ProjectType,
  answers: number[],
): { weightedAverage: number; weightedScore: number } {
  if (answers.length !== 10) {
    throw new Error("Complexity answers must contain exactly 10 values.");
  }
  const weights = getComplexityWeights(type);
  const weightedAverage = answers.reduce((total, answer, idx) => {
    const clampedAnswer = Math.max(0, Math.min(5, answer));
    return total + clampedAnswer * weights[idx];
  }, 0);
  const weightedScore = weightedAverage * 10;
  return { weightedAverage, weightedScore };
}

export function mapScoreToMultiplier(score: number): number {
  const clamped = clampScore(score);
  for (const band of COMPLEXITY_BANDS) {
    if (clamped <= band.max) {
      if ("multiplier" in band) {
        return band.multiplier;
      }
      return interpolate(
        clamped,
        band.min,
        band.max,
        band.minMultiplier,
        band.maxMultiplier,
      );
    }
  }
  const lastBand = COMPLEXITY_BANDS[COMPLEXITY_BANDS.length - 1];
  if ("maxMultiplier" in lastBand) {
    return lastBand.maxMultiplier;
  }
  if ("multiplier" in lastBand) {
    return lastBand.multiplier;
  }
  return 1.4;
}

export function calculateComplexityMultiplier(
  type: ProjectType,
  answers: number[],
): { weightedScore: number; multiplier: number } {
  const { weightedScore } = calculateComplexityScore(type, answers);
  return {
    weightedScore,
    multiplier: mapScoreToMultiplier(weightedScore),
  };
}
