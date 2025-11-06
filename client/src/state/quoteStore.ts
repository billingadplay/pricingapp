import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PROJECT_TYPES,
  TEMPLATE_CONFIGS,
  type ProjectType,
  type CrewLineInput,
  type GearLineInput,
  type QuoteOutput,
  type SkillLevel,
} from "@shared/pricing";

export type FlagsState = {
  animations?: boolean;
  voiceover?: boolean;
  sfx?: boolean;
};

export type OutputsState = {
  portrait?: boolean;
  cut15?: boolean;
  cut30?: boolean;
  cut60?: boolean;
};

type BasicInfo = {
  durationMin: number;
  deliveryDays: number;
  flags: FlagsState;
  outputs: OutputsState;
  brief: string;
};

export type BusinessState = {
  incomeGoal?: number;
  livingCost?: number;
  skillLevel?: SkillLevel;
  profitMarginPct?: number;
};

export type QuoteDraft = {
  projectType: ProjectType | null;
  basic: BasicInfo;
  crew: CrewLineInput[];
  gear: GearLineInput[];
  oop: {
    transport?: number;
    fnb?: number;
    misc?: number;
  };
  complexityAnswers: number[];
  business: BusinessState;
  contingencyPct: number;
  quote?: QuoteOutput;
  meta: {
    projectTitle?: string;
    clientName?: string;
  };
};

const EMPTY_DRAFT: QuoteDraft = {
  projectType: null,
  basic: {
    durationMin: 60,
    deliveryDays: 7,
    flags: {},
    outputs: {},
    brief: "",
  },
  crew: [],
  gear: [],
  oop: {},
  complexityAnswers: Array(10).fill(0),
  business: { skillLevel: "intermediate", profitMarginPct: 0.1 },
  contingencyPct: 0.05,
  quote: undefined,
  meta: {},
};

export type QuoteStore = {
  draft: QuoteDraft;
  setProjectType: (type: ProjectType) => void;
  updateBasic: (update: Partial<BasicInfo>) => void;
  setCrew: (crew: CrewLineInput[]) => void;
  setGear: (gear: GearLineInput[]) => void;
  setOOP: (oop: QuoteDraft["oop"]) => void;
  setComplexityAnswers: (answers: number[]) => void;
  setBusiness: (update: Partial<BusinessState>) => void;
  setContingency: (pct: number) => void;
  setMeta: (update: Partial<QuoteDraft["meta"]>) => void;
  setQuote: (quote?: QuoteOutput) => void;
  reset: () => void;
};

function cloneCrew(crew: CrewLineInput[]): CrewLineInput[] {
  return crew.map((line) => ({ ...line }));
}

function cloneGear(gear: GearLineInput[]): GearLineInput[] {
  return gear.map((line) => ({ ...line }));
}

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set, get) => ({
      draft: EMPTY_DRAFT,
      setProjectType: (type) => {
        const template = TEMPLATE_CONFIGS[type];
        set((state) => ({
          draft: {
            ...state.draft,
            projectType: type,
            crew: cloneCrew(template.crew),
            gear: cloneGear(template.gear),
            contingencyPct: template.contingencyPct,
            quote: undefined,
          },
        }));
      },
      updateBasic: (update) =>
        set((state) => ({
          draft: {
            ...state.draft,
            basic: { ...state.draft.basic, ...update },
            quote: undefined,
          },
        })),
      setCrew: (crew) =>
        set((state) => ({
          draft: { ...state.draft, crew: cloneCrew(crew), quote: undefined },
        })),
      setGear: (gear) =>
        set((state) => ({
          draft: { ...state.draft, gear: cloneGear(gear), quote: undefined },
        })),
      setOOP: (oop) =>
        set((state) => ({
          draft: { ...state.draft, oop: { ...oop }, quote: undefined },
        })),
      setComplexityAnswers: (answers) =>
        set((state) => ({
          draft: { ...state.draft, complexityAnswers: [...answers], quote: undefined },
        })),
      setBusiness: (update) =>
        set((state) => ({
          draft: {
            ...state.draft,
            business: { ...state.draft.business, ...update },
            quote: undefined,
          },
        })),
      setContingency: (pct) =>
        set((state) => ({
          draft: {
            ...state.draft,
            contingencyPct: pct,
            quote: undefined,
          },
        })),
      setMeta: (update) =>
        set((state) => ({
          draft: {
            ...state.draft,
            meta: { ...state.draft.meta, ...update },
          },
        })),
      setQuote: (quote) =>
        set((state) => ({
          draft: { ...state.draft, quote },
        })),
      reset: () => set({ draft: EMPTY_DRAFT }),
    }),
    {
      name: "pricingapp:draft",
      version: 1,
    },
  ),
);

export const projectTypes = PROJECT_TYPES;
