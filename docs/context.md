# Video Pricing Tool — MVP Product Spec test

Implementation-ready reference for the videography pricing MVP. Focus on delivering a defensible quote in minutes, exportable as PDF or screenshot-ready image.

---

## 1. Product Summary

- **Goal:** Give freelance videographers a standardized, defensible quote that covers scope, deliverables, T&Cs, and payment details.
- **Core Concept:** A short wizard gathers essentials → computes a **Base Cost of Delivery** → applies **complexity** and **business** multipliers → renders a **Final Price Summary**. Users refine inputs after the first calculation (crew, gear, margin slider, template choice) without restarting.

---

## 2. High-Level Flow (Happy Path)

1. **Project Type** selection.
2. **Basic Inputs** form (duration, timeline, flags, outputs, brief).
3. **Auto-Template** fills crew and gear from configuration.
4. **Base Cost Calculation** aggregates crew, gear, and OOP costs.
5. **Complexity Multipliers** derived from type-specific Likert questions.
6. **Business Constraints** (optional) adjust skill multiplier or markup.
7. **Final Summary** shows breakdown, totals, margin slider, export options, insights.
8. **Background:** Store anonymized snapshot for market insights.

### UX Guardrails

- Keep the first form lightweight.
- Allow refinements post-calculation with immediate feedback.

---

## 3. Screens & Components

### 3.1 Home / Project Type

- Grid of six cards (icon + description).
- Primary CTA: **Start Quote**.

### 3.2 Basic Info (Step 1)

- Fields: target duration (min), delivery timeline (days), complexity flags (`animations`, `voiceover`, `special effects`), output formats (`portrait`, `15s`, `30s`, `60s`), short brief.
- Submission triggers prefilled crew and gear template.

### 3.3 Crew & Gear (Step 2)

- Prefilled entries per project type; auto-add items based on flags.
- Inline edit fields: name/role, quantity, day-count, rate/day.
- Users can add or remove rows.

**Example default for `company_profile`:**

| Crew Role           | Days | Qty | Rate/day (Rp) |
| ------------------- | ---- | --- | ------------- |
| Director/DOP (self) | 1    | 1   | 5,000,000     |
| Photographer        | 1    | 1   | 2,500,000     |
| Assistant Cam       | 1    | 2   | 1,000,000     |
| Gaffer              | 1    | 1   | 3,000,000     |
| Editor              | 1    | 1   | 3,000,000     |
| Animator*           | 1    | 1   | TBD           |

| Gear Item | Days | Qty | Rate/day (Rp) |
| --------- | ---- | --- | ------------- |
| Camera    | 1    | 1   | 500,000       |
| Lens      | 1    | 1   | 300,000       |
| Drone     | 1    | 1   | 1,500,000     |
| Audio     | 1    | 1   | 500,000       |
| Lighting  | 1    | 1   | 2,000,000     |

`*` Animator added automatically when `animations` flag is checked.

### 3.4 Calculation Preview (Step 3)

- Displays computed Base Cost and provides **Refine with Multipliers** CTA.

### 3.5 Complexity & Business Refiners (Step 4)

- Ten Likert (0–5) questions tailored per project type.
- Outputs a complexity multiplier `M_complexity ∈ [0.8…1.8]`.
- Optional business constraints: monthly income goal, living cost, skill level (`beginner | intermediate | pro`) to derive `M_skill` and optional income uplift.

### 3.6 Final Price Summary (Step 5)

- Shows Development and Production breakdown tables.
- Summaries: Subtotal, Contingency (default 5%), Grand Total.
- Margin slider adjusts markup and displays estimated nett profit.
- Market insights: percentile ranges from anonymized history.
- Actions: `Save`, `Export PDF`, `Copy as Image`, `Change Template`.

---

## 4. Pricing Engine Model

### 4.1 Base Cost of Delivery

```ts
BaseCrew = Σ(crew.qty × crew.days × crew.ratePerDay)
BaseGear = Σ(gear.qty × gear.days × gear.ratePerDay)
BaseOOP  = transport + F&B + misc
BaseCost = BaseCrew + BaseGear + BaseOOP
```

### 4.2 Complexity Multiplier (`M_complexity`)

- Ten Likert answers → weighted score → multiplier.
- Weights and thresholds configurable per project type (e.g., Animation emphasizes storyboard, VO, SFX).

| Weighted Score Range | Suggested `M_complexity` |
| -------------------- | ------------------------ |
| 0 – 10               | 0.90 – 1.00             |
| 11 – 20              | 1.05                    |
| 21 – 30              | 1.10                    |
| 31 – 35              | 1.20                    |
| 36 – 40              | 1.30 – 1.40             |

### 4.3 Skill Level Multiplier (`M_skill`)

`beginner = 0.95`, `intermediate = 1.00`, `pro = 1.15` (configurable).

### 4.4 Income Goal Adjustment (`M_income`, Optional)

```ts
DaysEstimated = max(1, totalCrewDays)
DailyTarget   = (IncomeGoal - LivingCost) / WorkingDaysPerMonth
Shortfall     = max(0, DailyTarget - (BaseCrew / DaysEstimatedPerPaidRole))
M_income      = 1 + clamp(Shortfall / BaseCrew, 0, 0.25)
```

- Cap uplift at +25%.
- Store values for analytics even if excluded from final price.

### 4.5 Contingency & Margin

```ts
Subtotal    = BaseCost × M_complexity × M_skill × (optional M_income)
Contingency = Subtotal × 0.05
GrandTotal  = Subtotal + Contingency
ClientPrice = GrandTotal × (1 + ProfitMargin%)
NettProfit  = ClientPrice - GrandTotal
```

---

## 5. Templates & Auto-Rules

- Per project type, maintain JSON/TS config with default crew, gear, rates, and days.
- Store complexity weights (array of length 10, sum to 1) and auto-add/remove rules (e.g., `outputs.portrait` ⇒ extra editor half-day).
- Output templates receive a normalized Quote DTO and render to PDF.
  - **Template A:** Minimal layout (header, info block, breakdown table, totals, market insight, static T&Cs).
  - **Template B:** Future visual variant.

---

## 6. Data Model

### 6.1 Project

```ts
Project {
  id: string;
  type: 'company_profile' | 'ads' | 'fashion' | 'event' | 'social' | 'animation';
  basic: {
    durationMin: number;
    deliveryDays: number;
    flags: { animations: boolean; voiceover: boolean; sfx: boolean };
    outputs: { portrait: boolean; cut15: boolean; cut30: boolean; cut60: boolean };
    brief: string;
  };
  crew: Array<{ role: string; qty: number; days: number; rate: number }>;
  gear: Array<{ name: string; qty: number; days: number; rate: number }>;
  oop?: { transport?: number; fnb?: number; misc?: number };
  complexity: {
    answers: number[];
    weightedScore: number;
    multiplier: number;
  };
  business?: {
    incomeGoal?: number;
    livingCost?: number;
    skill: 'beginner' | 'intermediate' | 'pro';
  };
  subtotal: number;
  contingencyPct: number;
  grandTotal: number;
  profitMarginPct?: number;
  clientPrice?: number;
  nettProfit?: number;
  createdAt: string;
}
```

### 6.2 MarketSnapshot

```ts
MarketSnapshot {
  id: string;
  type: Project['type'];
  durationMin: number;
  deliveryDays: number;
  complexityScore: number;
  baseCost: number;
  subtotal: number;
  grandTotal: number;
  clientPrice?: number;
  createdAt: string;
}
```

### 6.3 TemplateConfig

```ts
TemplateConfig {
  type: Project['type'];
  defaultCrew: Project['crew'];
  defaultGear: Project['gear'];
  complexityWeights: number[];
  rules: Array<AutoRule>;
}
```

---

## 7. API (Prefix `/api`)

### `POST /projects/estimate`

- Accepts partial Project payload.
- Returns calculated totals, multipliers, breakdown, and market insight snapshot.

#### Example Request

```json
{
  "type": "company_profile",
  "basic": {
    "durationMin": 120,
    "deliveryDays": 7,
    "flags": { "animations": false, "voiceover": true, "sfx": false },
    "outputs": { "portrait": true, "cut15": true, "cut30": false, "cut60": true },
    "brief": "Company intro + facility tour"
  },
  "crew": [{ "role": "Director/DOP", "qty": 1, "days": 1, "rate": 5000000 }],
  "gear": [{ "name": "Camera", "qty": 1, "days": 1, "rate": 500000 }],
  "oop": { "transport": 300000, "fnb": 200000 },
  "complexity": { "answers": [3, 3, 2, 1, 3, 2, 2, 1, 2, 1] },
  "business": {
    "incomeGoal": 30000000,
    "livingCost": 10000000,
    "skill": "intermediate"
  },
  "contingencyPct": 0.05,
  "profitMarginPct": 0.1
}
```

#### Example Response

```json
{
  "projectId": "p_123",
  "subtotal": 12345000,
  "contingency": 617250,
  "grandTotal": 12962250,
  "clientPrice": 14258475,
  "nettProfit": 1296225,
  "complexity": {
    "weightedScore": 26.4,
    "multiplier": 1.1
  },
  "breakdown": {
    "development": [],
    "production": []
  },
  "insights": {
    "p50": 12000000,
    "p80": 16000000,
    "note": "Based on 58 similar projects (duration 90–150 min)."
  }
}
```

### `POST /projects`

- Same payload as `/projects/estimate`, persists and returns project ID.

### `GET /projects/:id`

- Returns a persisted Project.

### `POST /export/pdf`

- Body: `{ "projectId": string, "template": "A" | "B" }`.
- Response: PDF stream or URL.

### `GET /health`

- Returns `{ "ok": true }`.

- All endpoints validate input with Zod.

---

## 8. Calculation Configuration

- Centralize constants in versioned config modules:
  - `rates.ts` → default day rates.
  - `complexity.ts` → question weights, score thresholds, multiplier mapping.
  - `rules.ts` → auto-add/remove logic.
  - `contingency.ts` → default contingency percent.
  - `skill.ts` → skill-to-multiplier map.
- Provide per-type overrides.
- Deliver a seed script that inserts defaults for each project type.

---

## 9. Market Insights

- On save or export, persist anonymized `MarketSnapshot`.
- MVP: compute basic stats (p50, p80) from recent snapshots on demand, with optional in-memory caching.
- Future: nightly job to compute percentiles by type, duration, and complexity buckets.
- Privacy: never store client names or identifiers.

---

## 10. Export & Presentation

- **Export PDF:** Render Quote DTO into Template A (minimal layout).
  - Header (brand + project type + date).
  - Client & project info (brief, duration, outputs).
  - Pricing table (Development + Production).
  - Subtotal, contingency, grand total.
  - Profit margin and nett profit (if applied).
  - Market insights panel.
  - Static T&Cs and payment terms (editable in future).
- **Copy as Image:** Generate PNG of the summary table and totals.

---

## 11. Non-Goals (MVP)

- Authentication, roles, invoicing, or payments.
- Multi-currency and tax engine.
- Deep asset library or CRM features.

---

## 12. Tech Stack & Environment

- **Frontend:** React, Vite, Tailwind (single-page wizard).
- **Backend:** Express, Zod, Drizzle ORM (PostgreSQL).
- **Database:** Neon (free tier).
- **Local Dev:** Vite `5173`, API `3000` (proxy `/api` via Vite).
- **Export:** HTML → PDF using Puppeteer, Playwright, or `pdf-lib`.
- **Environment Variables:** `.env` holding `DATABASE_URL`, `PORT`, `HOST`.

---

## 13. Acceptance Criteria

- [ ] User can select any of six project types.
- [ ] Basic Info step uses no more than six fields.
- [ ] Crew & Gear auto-populate and remain editable.
- [ ] Complexity Likert shows 10 type-aware questions and yields multiplier.
- [ ] Skill level and optional income goals captured.
- [ ] Summary displays Development/Production breakdown, Subtotal, 5% Contingency, Grand Total.
- [ ] Margin slider updates client price and nett profit in real time.
- [ ] Export PDF (Template A) works.
- [ ] Anonymized snapshot stored for insights.
- [ ] Health check endpoint returns `{ ok: true }`.
- [ ] Server validates all inputs with Zod.
- [ ] Initial quote appears immediately after first form; refinements happen afterward.

---

## 14. Future Iterations

- User accounts, saved clients, branded templates.
- Benchmarks by city/industry with advanced filters.
- Payment links (e.g., Stripe) for deposits.
- Expand to other creative services (graphic design, motion, photo).
- Agency vs solo modes with distinct defaults.

---

## 15. Database Schema

### 15.1 Postgres Types & Enums

```sql
create type project_type as enum (
  'company_profile',
  'ads',
  'fashion',
  'event',
  'social',
  'animation'
);

create type skill_level as enum ('beginner', 'intermediate', 'pro');

create type line_category as enum ('development', 'production', 'expense');
```

### 15.2 Core Tables

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  type project_type not null,
  duration_min integer not null check (duration_min > 0),
  delivery_days integer not null check (delivery_days > 0),
  flags jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  brief text,
  base_crew numeric(12,2) not null default 0,
  base_gear numeric(12,2) not null default 0,
  base_oop numeric(12,2) not null default 0,
  base_cost numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null default 0,
  contingency_pct numeric(5,4) not null default 0.05 check (contingency_pct >= 0),
  contingency_value numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null default 0,
  profit_margin_pct numeric(5,4),
  client_price numeric(12,2),
  nett_profit numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_crew_lines (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  sort_order integer not null default 0,
  role text not null,
  qty numeric(6,2) not null default 1,
  days numeric(6,2) not null default 1,
  rate_per_day numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table project_gear_lines (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  sort_order integer not null default 0,
  name text not null,
  qty numeric(6,2) not null default 1,
  days numeric(6,2) not null default 1,
  rate_per_day numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table project_expense_lines (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  category text not null, -- e.g. transport, fnb, misc
  description text,
  amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table project_complexities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  answers smallint[] not null check (cardinality(answers) = 10),
  weighted_score numeric(6,2) not null,
  multiplier numeric(6,3) not null,
  created_at timestamptz not null default now()
);

create table project_business_overrides (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  income_goal numeric(12,2),
  living_cost numeric(12,2),
  skill skill_level not null,
  income_multiplier numeric(6,3),
  created_at timestamptz not null default now()
);

create table market_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  type project_type not null,
  duration_min integer not null,
  delivery_days integer not null,
  complexity_score numeric(6,2) not null,
  base_cost numeric(12,2) not null,
  subtotal numeric(12,2) not null,
  grand_total numeric(12,2) not null,
  client_price numeric(12,2),
  captured_at timestamptz not null default now()
);
```

### 15.3 Template Configuration Tables

```sql
create table template_configs (
  id uuid primary key default gen_random_uuid(),
  type project_type not null unique,
  label text not null,
  contingency_pct numeric(5,4) not null default 0.05,
  skill_defaults jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table template_crew_lines (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references template_configs(id) on delete cascade,
  sort_order integer not null default 0,
  role text not null,
  qty numeric(6,2) not null default 1,
  days numeric(6,2) not null default 1,
  rate_per_day numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table template_gear_lines (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references template_configs(id) on delete cascade,
  sort_order integer not null default 0,
  name text not null,
  qty numeric(6,2) not null default 1,
  days numeric(6,2) not null default 1,
  rate_per_day numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table template_complexity_weights (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references template_configs(id) on delete cascade,
  question_index smallint not null check (question_index between 0 and 9),
  weight numeric(6,4) not null,
  constraint uq_template_question unique (template_id, question_index),
  constraint chk_weight_positive check (weight >= 0)
);

create table template_rules (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references template_configs(id) on delete cascade,
  name text not null,
  trigger jsonb not null,
  action jsonb not null,
  created_at timestamptz not null default now()
);
```

### 15.4 Operational Tables

```sql
create table audit_logs (
  id bigserial primary key,
  namespace text not null,
  entity_id uuid,
  action text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table job_runs (
  id bigserial primary key,
  job_name text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null,
  metadata jsonb
);
```

### 15.5 Recommended Indexes

- `create index idx_projects_type_created_at on projects (type, created_at desc);`
- `create index idx_market_snapshots_type on market_snapshots (type, captured_at desc);`
- `create index idx_project_complexities_project on project_complexities (project_id);`
- `create index idx_template_rules_template on template_rules (template_id);`

### 15.6 Drizzle Schema (TypeScript)

```ts
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: pgEnum('project_type')(['company_profile','ads','fashion','event','social','animation']),
  durationMin: integer('duration_min').notNull(),
  deliveryDays: integer('delivery_days').notNull(),
  flags: jsonb('flags').$type<Project['basic']['flags']>().notNull().default({ animations: false, voiceover: false, sfx: false }),
  outputs: jsonb('outputs').$type<Project['basic']['outputs']>().notNull().default({ portrait: false, cut15: false, cut30: false, cut60: false }),
  brief: text('brief'),
  baseCrew: numeric('base_crew', { precision: 12, scale: 2 }).notNull().default('0'),
  baseGear: numeric('base_gear', { precision: 12, scale: 2 }).notNull().default('0'),
  baseOop: numeric('base_oop', { precision: 12, scale: 2 }).notNull().default('0'),
  baseCost: numeric('base_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  contingencyPct: numeric('contingency_pct', { precision: 5, scale: 4 }).notNull().default('0.05'),
  contingencyValue: numeric('contingency_value', { precision: 12, scale: 2 }).notNull().default('0'),
  grandTotal: numeric('grand_total', { precision: 12, scale: 2 }).notNull().default('0'),
  profitMarginPct: numeric('profit_margin_pct', { precision: 5, scale: 4 }),
  clientPrice: numeric('client_price', { precision: 12, scale: 2 }),
  nettProfit: numeric('nett_profit', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const projectCrewLines = pgTable('project_crew_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  role: text('role').notNull(),
  qty: numeric('qty', { precision: 6, scale: 2 }).notNull().default('1'),
  days: numeric('days', { precision: 6, scale: 2 }).notNull().default('1'),
  ratePerDay: numeric('rate_per_day', { precision: 12, scale: 2 }).notNull().default('0'),
  lineTotal: numeric('line_total', { precision: 12, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
// (Define projectGearLines, projectExpenseLines, projectComplexities, projectBusinessOverrides, marketSnapshots, template tables similarly)
```

---

## 16. Recommended Project Structure

```text
pricing-tool/
├── apps/
│   ├── api/                     # Express + Zod backend
│   │   ├── src/
│   │   │   ├── server.ts        # HTTP bootstrap
│   │   │   ├── app.ts           # Express app factory
│   │   │   ├── routes/
│   │   │   │   ├── health.route.ts
│   │   │   │   ├── projects.route.ts
│   │   │   │   └── export.route.ts
│   │   │   ├── modules/
│   │   │   │   ├── pricing/
│   │   │   │   │   ├── calculator.ts
│   │   │   │   │   ├── multipliers.ts
│   │   │   │   │   └── dto.ts
│   │   │   │   ├── projects/
│   │   │   │   │   ├── controller.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   └── repository.ts
│   │   │   │   └── exports/
│   │   │   │       ├── pdf.service.ts
│   │   │   │       └── template-a/
│   │   │   ├── middleware/
│   │   │   ├── validators/
│   │   │   ├── config/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── test/
│   │   └── package.json
│   └── web/                     # React + Vite frontend
│       ├── src/
│       │   ├── main.tsx
│       │   ├── app/
│       │   │   ├── routes/
│       │   │   ├── components/
│       │   │   │   ├── forms/
│       │   │   │   ├── layout/
│       │   │   │   └── summary/
│       │   │   ├── hooks/
│       │   │   ├── lib/
│       │   │   ├── state/
│       │   │   └── styles/
│       │   ├── assets/
│       │   └── tests/
│       ├── public/
│       └── package.json
├── packages/
│   ├── db/                      # Drizzle schema, migrations, seed helpers
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   ├── migrations/
│   │   │   └── seed/
│   │   └── package.json
│   ├── config/                  # Rates, complexity weights, rules
│   │   ├── src/
│   │   │   ├── rates.ts
│   │   │   ├── complexity.ts
│   │   │   ├── rules.ts
│   │   │   ├── contingency.ts
│   │   │   └── skill.ts
│   │   └── package.json
│   └── shared/                  # Cross-cutting types & utilities
│       ├── src/
│       │   ├── types/
│       │   │   ├── dto.ts
│       │   │   └── enums.ts
│       │   ├── constants/
│       │   └── utils/
│       └── package.json
├── scripts/
│   ├── seed-templates.ts
│   ├── generate-snapshots.ts
│   └── lint-staged.config.js
├── drizzle.config.ts
├── package.json                 # Root dev scripts (pnpm monorepo or npm workspaces)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── turbo.json                   # Optional task runner
├── docs/
│   ├── context.md
│   └── design_guidelines.md
├── .env.example
└── README.md
```

### Folder Responsibilities

- **apps/api:** HTTP server, request validation, orchestrating pricing engine, persistence.
- **apps/web:** SPA wizard, hooks for calling `/api`, UI state management, PDF/export triggers.
- **packages/db:** Drizzle schema, query utilities, migrations, seed data.
- **packages/config:** Centralized pricing constants and rules consumed by both frontend and backend.
- **packages/shared:** Reusable DTOs, type guards, logging utilities, and pure functions.
- **scripts:** Operational tooling (seeding, maintenance tasks).
- **docs:** Living documentation for product and design context.

---

### Developer Handoff Notes

- Render the initial price in under three seconds.
- Keep pricing constants centralized; avoid magic numbers.
- Implement multipliers and mappings as pure functions with unit tests.
- APIs should be idempotent to tolerate resubmits.
- Log every estimate by GUID for analytics.
