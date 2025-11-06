import type { TemplateConfig } from "./types";
import { DEFAULT_CONTINGENCY_PCT } from "./constants";

const BASE_SKILL_DEFAULTS = {
  beginner: 0.95,
  intermediate: 1.0,
  pro: 1.15,
} as const;

export const TEMPLATE_CONFIGS: Record<TemplateConfig["type"], TemplateConfig> = {
  company_profile: {
    type: "company_profile",
    label: "Company Profile",
    contingencyPct: DEFAULT_CONTINGENCY_PCT,
    skillDefaults: BASE_SKILL_DEFAULTS,
    crew: [
      { role: "Director/DOP", qty: 1, days: 1, ratePerDay: 5_000_000 },
      { role: "Photographer", qty: 1, days: 1, ratePerDay: 2_500_000 },
      { role: "Assistant Camera", qty: 2, days: 1, ratePerDay: 1_000_000 },
      { role: "Gaffer", qty: 1, days: 1, ratePerDay: 3_000_000 },
      { role: "Editor", qty: 1, days: 1, ratePerDay: 3_000_000 },
    ],
    gear: [
      { name: "Camera Kit", qty: 1, days: 1, ratePerDay: 500_000 },
      { name: "Lens Kit", qty: 1, days: 1, ratePerDay: 300_000 },
      { name: "Drone", qty: 1, days: 1, ratePerDay: 1_500_000 },
      { name: "Audio Kit", qty: 1, days: 1, ratePerDay: 500_000 },
      { name: "Lighting Kit", qty: 1, days: 1, ratePerDay: 2_000_000 },
    ],
    complexityWeights: [0.12, 0.1, 0.1, 0.08, 0.1, 0.15, 0.1, 0.1, 0.05, 0.1],
    rules: [
      {
        name: "Add Animator when animations requested",
        trigger: { flags: { animations: true } },
        action: {
          addCrew: [
            { role: "Animator", qty: 1, days: 1, ratePerDay: 2_500_000 },
          ],
        },
      },
    ],
  },
  ads: {
    type: "ads",
    label: "Ads / Commercial",
    contingencyPct: DEFAULT_CONTINGENCY_PCT,
    skillDefaults: BASE_SKILL_DEFAULTS,
    crew: [
      { role: "Director", qty: 1, days: 1, ratePerDay: 6_000_000 },
      { role: "Producer", qty: 1, days: 1, ratePerDay: 3_500_000 },
      { role: "1st Assistant Director", qty: 1, days: 1, ratePerDay: 2_000_000 },
      { role: "DOP", qty: 1, days: 1, ratePerDay: 4_000_000 },
      { role: "Camera Assistant", qty: 2, days: 1, ratePerDay: 1_200_000 },
      { role: "Gaffer", qty: 1, days: 1, ratePerDay: 3_500_000 },
      { role: "Editor", qty: 1, days: 1, ratePerDay: 3_500_000 },
    ],
    gear: [
      { name: "Cinema Camera Package", qty: 1, days: 1, ratePerDay: 1_500_000 },
      { name: "Lens Set", qty: 1, days: 1, ratePerDay: 750_000 },
      { name: "Lighting Package", qty: 1, days: 1, ratePerDay: 2_500_000 },
      { name: "Grip & Rigging", qty: 1, days: 1, ratePerDay: 1_000_000 },
      { name: "Audio Package", qty: 1, days: 1, ratePerDay: 600_000 },
    ],
    complexityWeights: [0.1, 0.14, 0.12, 0.1, 0.08, 0.16, 0.1, 0.08, 0.06, 0.06],
    rules: [
      {
        name: "Extra editor day for multiple outputs",
        trigger: { outputs: { cut15: true, cut30: true } },
        action: {
          adjustCrewDays: [{ role: "Editor", days: 0.5 }],
        },
      },
    ],
  },
  fashion: {
    type: "fashion",
    label: "Fashion",
    contingencyPct: DEFAULT_CONTINGENCY_PCT,
    skillDefaults: BASE_SKILL_DEFAULTS,
    crew: [
      { role: "Creative Director", qty: 1, days: 1, ratePerDay: 5_500_000 },
      { role: "Director/DOP", qty: 1, days: 1, ratePerDay: 4_500_000 },
      { role: "Stylist", qty: 1, days: 1, ratePerDay: 3_000_000 },
      { role: "Camera Assistant", qty: 1, days: 1, ratePerDay: 1_200_000 },
      { role: "Gaffer", qty: 1, days: 1, ratePerDay: 3_000_000 },
      { role: "Editor/Colorist", qty: 1, days: 1, ratePerDay: 3_500_000 },
    ],
    gear: [
      { name: "Camera + Prime Lens Kit", qty: 1, days: 1, ratePerDay: 900_000 },
      { name: "Stabiliser", qty: 1, days: 1, ratePerDay: 600_000 },
      { name: "Lighting Fashion Kit", qty: 1, days: 1, ratePerDay: 2_200_000 },
      { name: "Backdrop & Props", qty: 1, days: 1, ratePerDay: 800_000 },
    ],
    complexityWeights: [0.11, 0.12, 0.11, 0.08, 0.09, 0.13, 0.1, 0.1, 0.08, 0.08],
    rules: [
      {
        name: "Add Makeup Artist for high complexity",
        trigger: { flags: { sfx: true } },
        action: {
          addCrew: [
            { role: "Makeup Artist", qty: 1, days: 1, ratePerDay: 2_000_000 },
          ],
        },
      },
    ],
  },
  event: {
    type: "event",
    label: "Event Coverage",
    contingencyPct: DEFAULT_CONTINGENCY_PCT,
    skillDefaults: BASE_SKILL_DEFAULTS,
    crew: [
      { role: "Lead Videographer", qty: 1, days: 1, ratePerDay: 3_500_000 },
      { role: "Second Shooter", qty: 1, days: 1, ratePerDay: 2_500_000 },
      { role: "Drone Operator", qty: 1, days: 1, ratePerDay: 2_000_000 },
      { role: "Field Producer", qty: 1, days: 1, ratePerDay: 2_500_000 },
      { role: "Editor", qty: 1, days: 1, ratePerDay: 3_000_000 },
    ],
    gear: [
      { name: "Camera Kit A", qty: 1, days: 1, ratePerDay: 600_000 },
      { name: "Camera Kit B", qty: 1, days: 1, ratePerDay: 500_000 },
      { name: "Audio Wireless Kit", qty: 1, days: 1, ratePerDay: 450_000 },
      { name: "Stabiliser", qty: 1, days: 1, ratePerDay: 400_000 },
      { name: "Portable Lighting", qty: 1, days: 1, ratePerDay: 300_000 },
    ],
    complexityWeights: [0.08, 0.09, 0.13, 0.1, 0.08, 0.1, 0.09, 0.09, 0.12, 0.12],
    rules: [
      {
        name: "Add livestream tech for high logistics",
        trigger: { logistics: { livestream: true } },
        action: {
          addCrew: [
            { role: "Livestream Technician", qty: 1, days: 1, ratePerDay: 2_200_000 },
          ],
        },
      },
    ],
  },
  social: {
    type: "social",
    label: "Social Media (YT/TikTok/Reels)",
    contingencyPct: DEFAULT_CONTINGENCY_PCT,
    skillDefaults: BASE_SKILL_DEFAULTS,
    crew: [
      { role: "Content Director", qty: 1, days: 1, ratePerDay: 3_000_000 },
      { role: "Videographer", qty: 1, days: 1, ratePerDay: 2_500_000 },
      { role: "Editor/Motion", qty: 1, days: 1, ratePerDay: 2_500_000 },
      { role: "Production Assistant", qty: 1, days: 1, ratePerDay: 900_000 },
    ],
    gear: [
      { name: "Mirrorless Camera", qty: 1, days: 1, ratePerDay: 400_000 },
      { name: "Prime Lens Set", qty: 1, days: 1, ratePerDay: 300_000 },
      { name: "Audio Kit", qty: 1, days: 1, ratePerDay: 250_000 },
      { name: "Portable Lighting", qty: 1, days: 1, ratePerDay: 250_000 },
    ],
    complexityWeights: [0.1, 0.11, 0.12, 0.08, 0.12, 0.1, 0.09, 0.08, 0.1, 0.1],
    rules: [
      {
        name: "Extra edit time for multiple deliverables",
        trigger: { outputs: { cut15: true, cut30: true, cut60: true } },
        action: {
          adjustCrewDays: [{ role: "Editor/Motion", days: 0.5 }],
        },
      },
    ],
  },
  animation: {
    type: "animation",
    label: "Animation / Motion",
    contingencyPct: DEFAULT_CONTINGENCY_PCT,
    skillDefaults: BASE_SKILL_DEFAULTS,
    crew: [
      { role: "Creative Director", qty: 1, days: 1, ratePerDay: 4_500_000 },
      { role: "Producer", qty: 1, days: 1, ratePerDay: 3_000_000 },
      { role: "Storyboard Artist", qty: 1, days: 1, ratePerDay: 2_500_000 },
      { role: "Animator/Motion Designer", qty: 1, days: 1, ratePerDay: 4_000_000 },
      { role: "Illustrator", qty: 1, days: 1, ratePerDay: 3_000_000 },
      { role: "Sound Designer", qty: 1, days: 1, ratePerDay: 2_000_000 },
    ],
    gear: [
      { name: "Animation Workstation", qty: 1, days: 1, ratePerDay: 500_000 },
      { name: "Software Licenses", qty: 1, days: 1, ratePerDay: 400_000 },
      { name: "Voiceover Booth", qty: 1, days: 1, ratePerDay: 700_000 },
    ],
    complexityWeights: [0.08, 0.14, 0.12, 0.1, 0.1, 0.11, 0.09, 0.08, 0.09, 0.09],
    rules: [
      {
        name: "Add Voiceover talent when requested",
        trigger: { flags: { voiceover: true } },
        action: {
          addCrew: [
            { role: "Voice Over Talent", qty: 1, days: 1, ratePerDay: 2_000_000 },
          ],
        },
      },
      {
        name: "Add FX specialist for SFX",
        trigger: { flags: { sfx: true } },
        action: {
          addCrew: [
            { role: "VFX Specialist", qty: 1, days: 1, ratePerDay: 3_000_000 },
          ],
        },
      },
    ],
  },
};

export function getTemplateConfig(type: TemplateConfig["type"]): TemplateConfig {
  return TEMPLATE_CONFIGS[type];
}
