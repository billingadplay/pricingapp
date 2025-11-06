/* eslint-disable no-console */

import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { eq } from "drizzle-orm";
import {
  templateConfigs,
  templateCrewLines,
  templateGearLines,
  templateComplexityWeights,
  templateRules,
  type TemplateConfig,
} from "../server/db/schema";
import { db, pool } from "../server/db/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv({ path: path.resolve(__dirname, "..", ".env") });
loadEnv({ path: path.resolve(__dirname, "..", "server", ".env") });

type NumericString = `${number}` | string;

type CrewLine = {
  role: string;
  qty: number;
  days: number;
  ratePerDay: number;
};

type GearLine = {
  name: string;
  qty: number;
  days: number;
  ratePerDay: number;
};

type TemplateDefinition = {
  type: TemplateConfig["type"];
  label: string;
  contingencyPct?: number;
  skillDefaults: Record<string, number>;
  crew: CrewLine[];
  gear: GearLine[];
  complexityWeights: number[];
  rules: Array<{
    name: string;
    trigger: Record<string, unknown>;
    action: Record<string, unknown>;
  }>;
};

const BASE_SKILL_DEFAULTS = {
  beginner: 0.95,
  intermediate: 1.0,
  pro: 1.15,
};

const templateDefinitions: TemplateDefinition[] = [
  {
    type: "company_profile",
    label: "Company Profile",
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
  {
    type: "ads",
    label: "Ads / Commercial",
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
  {
    type: "fashion",
    label: "Fashion",
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
  {
    type: "event",
    label: "Event Coverage",
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
      { name: "Lighting Portable", qty: 1, days: 1, ratePerDay: 300_000 },
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
  {
    type: "social",
    label: "Social Media (YT/TikTok/Reels)",
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
  {
    type: "animation",
    label: "Animation / Motion",
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
];

function toNumericString(value: number): NumericString {
  return value.toString();
}

async function upsertTemplate(def: TemplateDefinition) {
  const now = new Date();
  const contingency = def.contingencyPct ?? 0.05;

  const [template] = await db
    .insert(templateConfigs)
    .values({
      type: def.type,
      label: def.label,
      contingencyPct: toNumericString(contingency),
      skillDefaults: def.skillDefaults,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: templateConfigs.type,
      set: {
        label: def.label,
        contingencyPct: toNumericString(contingency),
        skillDefaults: def.skillDefaults,
        updatedAt: now,
      },
    })
    .returning();

  const templateId = template.id;

  await db.delete(templateCrewLines).where(eq(templateCrewLines.templateId, templateId));
  await db.delete(templateGearLines).where(eq(templateGearLines.templateId, templateId));
  await db
    .delete(templateComplexityWeights)
    .where(eq(templateComplexityWeights.templateId, templateId));
  await db.delete(templateRules).where(eq(templateRules.templateId, templateId));

  if (def.crew.length > 0) {
    await db.insert(templateCrewLines).values(
      def.crew.map((line, index) => ({
        templateId,
        sortOrder: index,
        role: line.role,
        qty: toNumericString(line.qty),
        days: toNumericString(line.days),
        ratePerDay: toNumericString(line.ratePerDay),
      })),
    );
  }

  if (def.gear.length > 0) {
    await db.insert(templateGearLines).values(
      def.gear.map((line, index) => ({
        templateId,
        sortOrder: index,
        name: line.name,
        qty: toNumericString(line.qty),
        days: toNumericString(line.days),
        ratePerDay: toNumericString(line.ratePerDay),
      })),
    );
  }

  if (def.complexityWeights.length !== 10) {
    console.warn(
      `Template ${def.type} has ${def.complexityWeights.length} complexity weights. Expected 10. Please update docs/context.md.`,
    );
  } else if (def.complexityWeights.length > 0) {
    await db.insert(templateComplexityWeights).values(
      def.complexityWeights.map((weight, index) => ({
        templateId,
        questionIndex: index,
        weight: toNumericString(Number(weight.toFixed(4))),
      })),
    );
  }

  if (def.rules.length > 0) {
    await db.insert(templateRules).values(
      def.rules.map((rule) => ({
        templateId,
        name: rule.name,
        trigger: rule.trigger,
        action: rule.action,
      })),
    );
  }

  console.log(`Seeded template: ${def.label}`);
}

export async function seed() {
  console.log("Starting template seed...");

  for (const def of templateDefinitions) {
    await upsertTemplate(def);
  }

  console.log("Template seed complete.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .catch((error) => {
      console.error("Seed script failed:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}
