import type {
  CrewLineInput,
  GearLineInput,
  TemplateRule,
  ProjectType,
  TemplateConfig,
} from "@shared/pricing";

import type { FlagsState, OutputsState } from "@/state/quoteStore";

type BaseTotals = {
  baseCrew: number;
  baseGear: number;
  baseOOP: number;
  baseCost: number;
};

export function computeLineTotal(line: CrewLineInput | GearLineInput): number {
  return Math.max(0, line.qty) * Math.max(0, line.days) * Math.max(0, line.ratePerDay);
}

export function computeBaseTotals(
  crew: CrewLineInput[],
  gear: GearLineInput[],
  oop: { transport?: number; fnb?: number; misc?: number },
): BaseTotals {
  const baseCrew = crew.reduce((total, line) => total + computeLineTotal(line), 0);
  const baseGear = gear.reduce((total, line) => total + computeLineTotal(line), 0);
  const baseOOP = [oop.transport, oop.fnb, oop.misc]
    .map((value) => Number(value ?? 0))
    .reduce((total, value) => total + Math.max(0, value), 0);

  const baseCost = baseCrew + baseGear + baseOOP;
  return {
    baseCrew,
    baseGear,
    baseOOP,
    baseCost,
  };
}

type ApplyAutoRulesArgs = {
  projectType: ProjectType | null;
  crew: CrewLineInput[];
  gear: GearLineInput[];
  flags: FlagsState;
  outputs: OutputsState;
  template: TemplateConfig | undefined;
};

export function applyAutoRules({
  projectType,
  crew,
  gear,
  flags,
  outputs,
  template,
}: ApplyAutoRulesArgs): {
  crew: CrewLineInput[];
  gear: GearLineInput[];
  changed: boolean;
} {
  if (!projectType || !template) {
    return { crew, gear, changed: false };
  }

  const rules = template.rules ?? [];
  if (!rules.length) {
    return { crew, gear, changed: false };
  }

  let crewChanged = false;
  let gearChanged = false;
  const crewLines = [...crew];
  const gearLines = [...gear];

  const ensureCrewRole = (line: CrewLineInput) => {
    const exists = crewLines.some((existing) => existing.role.toLowerCase() === line.role.toLowerCase());
    if (!exists) {
      crewLines.push({ ...line });
      crewChanged = true;
    }
  };

  const adjustCrewDays = (role: string, delta: number) => {
    const index = crewLines.findIndex((line) => line.role.toLowerCase() === role.toLowerCase());
    if (index >= 0) {
      const current = crewLines[index];
      const updatedDays = Math.max(0, (current.days ?? 0) + delta);
      if (updatedDays !== current.days) {
        crewLines[index] = { ...current, days: updatedDays };
        crewChanged = true;
      }
    }
  };

  const matchesTrigger = (rule: TemplateRule): boolean => {
    const trigger = rule.trigger as {
      flags?: Partial<Record<keyof FlagsState, boolean>>;
      outputs?: Partial<Record<keyof OutputsState, boolean>>;
      logistics?: unknown;
    };

    if (trigger.flags) {
      for (const [key, expected] of Object.entries(trigger.flags)) {
        if (Boolean(flags[key as keyof FlagsState]) !== Boolean(expected)) {
          return false;
        }
      }
    }

    if (trigger.outputs) {
      for (const [key, expected] of Object.entries(trigger.outputs)) {
        if (Boolean(outputs[key as keyof OutputsState]) !== Boolean(expected)) {
          return false;
        }
      }
    }

    // Ignore triggers we do not track (e.g. logistics) – treat as unmet.
    if (rule.trigger.logistics) {
      return false;
    }

    return true;
  };

  rules.forEach((rule) => {
    if (!matchesTrigger(rule)) {
      return;
    }

    const action = rule.action as {
      addCrew?: CrewLineInput[];
      adjustCrewDays?: { role: string; days: number }[];
      addGear?: GearLineInput[];
    };

    if (Array.isArray(action.addCrew)) {
      action.addCrew.forEach(ensureCrewRole);
    }

    if (Array.isArray(action.adjustCrewDays)) {
      action.adjustCrewDays.forEach((adjustment) => {
        adjustCrewDays(adjustment.role, adjustment.days);
      });
    }

    if (Array.isArray(action.addGear)) {
      action.addGear.forEach((line) => {
        const exists = gearLines.some((existing) => existing.name.toLowerCase() === line.name.toLowerCase());
        if (!exists) {
          gearLines.push({ ...line });
          gearChanged = true;
        }
      });
    }
  });

  return {
    crew: crewChanged ? crewLines : crew,
    gear: gearChanged ? gearLines : gear,
    changed: crewChanged || gearChanged,
  };
}
