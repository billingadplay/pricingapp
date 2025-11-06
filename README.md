# PriceRight - Videographer Pricing Tool

A systematic, professional quotation tool for videographers and video production companies. Stop guessing prices—create defensible quotes in minutes with automated cost calculations, complexity multipliers, and market insights.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.11-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Database](#database)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Functionality
- **6 Project Types**: Company Profile, Ads, Fashion, Event, Social Media, Animation
- **Smart Cost Calculator**: Auto-computes crew, gear, and expense costs
- **Complexity Multipliers**: 10 Likert-scale questions tailored per project type
- **Business Refinements**: Skill level adjustments (beginner/intermediate/pro)
- **Margin Control**: Interactive slider to adjust profit margins in real-time
- **Editable Contingency**: Customize safety buffer (default 5%)
- **PDF Export**: Professional quotation documents ready to send clients
- **Market Insights**: Compare your quotes against industry benchmarks (coming soon)

### User Experience
- **Clean, Minimal Design**: A4-friendly printable summaries
- **Step-by-Step Wizard**: Basic Info → Crew & Gear → Complexity → Summary
- **Real-time Feedback**: Instant recalculations as you adjust values
- **Responsive UI**: Works on desktop, tablet, and mobile

### Technical Highlights
- **Type-Safe**: Full TypeScript coverage across client, server, and shared code
- **Validated Inputs**: Zod schemas for all API requests
- **Database-Backed**: PostgreSQL via Neon with Drizzle ORM
- **Monorepo**: Organized workspace for client, server, and shared packages

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Zustand** - Lightweight state management
- **React Query** - Server state & caching
- **Wouter** - Minimal client-side routing
- **Zod** - Runtime validation
- **React Hook Form** - Form state management

### Backend
- **Node.js 20+** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Type-safe database queries
- **Zod** - Request validation
- **PostgreSQL** - Database (via Neon)
- **Playwright** - PDF generation

### Development
- **tsx** - TypeScript execution (dev)
- **esbuild** - Fast bundling (production)
- **Vitest** - Unit testing
- **Drizzle Kit** - Database migrations

---

## 📁 Project Structure

```
pricingapp/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/           # Route components (Home, Builder, Summary)
│   │   ├── components/      # UI components (shadcn/ui)
│   │   ├── state/           # Zustand stores
│   │   ├── lib/             # Utilities, API client
│   │   └── main.tsx         # App entry point
│   ├── dist/                # Build output (gitignored)
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── server/                  # Express API
│   ├── routes/              # API routes (projects, quotes, export)
│   ├── controllers/         # Request handlers
│   ├── validators/          # Zod schemas
│   ├── db/                  # Database schema & client
│   ├── middleware/          # Express middleware
│   ├── services/            # Business logic
│   ├── utils/               # Helpers (PDF, currency)
│   ├── scripts/             # Seed & maintenance scripts
│   ├── dist/                # Build output (gitignored)
│   ├── index.ts             # Server entry point
│   └── package.json
│
├── shared/                  # Shared code
│   ├── pricing/             # Core pricing engine
│   │   ├── core.ts          # Base cost calculations
│   │   ├── complexity.ts    # Multiplier logic
│   │   ├── templates.ts     # Default crew/gear configs
│   │   └── constants.ts     # Rates, thresholds
│   ├── types/               # Shared TypeScript types
│   └── schema.ts            # Shared Zod schemas
│
├── docs/                    # Documentation
│   └── context.md           # Product spec & architecture
│
├── scripts/                 # Root-level scripts
├── package.json             # Root package (workspaces)
├── tsconfig.base.json       # Base TypeScript config
├── tailwind.config.ts       # Root Tailwind config
├── drizzle.config.ts        # Database config
├── render.yaml              # Render deployment config
└── .env.example             # Environment template
```

---

## 📦 Prerequisites

- **Node.js** >= 20.11.0 (for `import.meta.dirname` support)
- **npm** >= 10.0.0 (or pnpm/yarn)
- **PostgreSQL** database (recommend [Neon](https://neon.tech) free tier)
- **Git** for version control

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pricingapp.git
cd pricingapp
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies (root, client, server)
npm install
```

This installs dependencies for:
- Root workspace
- `client/` workspace
- `server/` workspace

---

## 🔐 Environment Setup

### 1. Copy Environment Templates

```bash
# Root environment
cp .env.example .env

# Server environment (optional - inherits from root)
cp server/.env.example server/.env

# Client environment (for custom API URLs)
cp client/.env.example client/.env
```

### 2. Configure Environment Variables

Edit `.env` in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require

# Server Configuration
NODE_ENV=development
PORT=3000
HOST=127.0.0.1

# Client API URL (development uses Vite proxy)
VITE_API_URL=http://localhost:3000/api
```

### 3. Get Your Neon Database URL

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from Dashboard → Connection Details
4. Choose "Pooled connection" for production
5. Paste into `DATABASE_URL` in `.env`

**Important**: Connection string must end with `?sslmode=require`

---

## 💻 Development

### Start Development Servers

**Option 1: Run Both (Client + Server)**
```bash
npm run dev:all
```
- Client: http://localhost:5173 (Vite with HMR)
- Server: http://localhost:3000 (Express with tsx watch)

**Option 2: Run Separately**
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Start client
npm run -w client dev
```

### Development Workflow

1. **Make changes** to client or server code
2. **Auto-reload**: Changes trigger hot module replacement (client) or restart (server)
3. **Type checking**: Run `npm run typecheck` to verify TypeScript
4. **View in browser**: http://localhost:5173

### API Proxy Configuration

In development, Vite proxies `/api/*` requests to the Express server:

[client/vite.config.ts](client/vite.config.ts#L41-L46):
```typescript
proxy: {
  "/api": {
    target: "http://127.0.0.1:3000",
    changeOrigin: true,
  },
}
```

---

## 🗄️ Database

### Push Schema to Database

```bash
# Push Drizzle schema to Neon
npm run db:push
```

This creates all tables defined in [server/db/schema.ts](server/db/schema.ts).

### Schema Overview

Tables created:
- `projects` - Project metadata (type, duration, totals)
- `project_crew_lines` - Crew members per project
- `project_gear_lines` - Equipment rentals per project
- `project_expense_lines` - Out-of-pocket expenses
- `project_complexities` - Complexity scores & multipliers
- `project_business_overrides` - Skill level & income goals
- `market_snapshots` - Anonymized pricing data
- `template_configs` - Default crew/gear templates
- `template_crew_lines` / `template_gear_lines` - Template details
- `template_complexity_weights` - Per-type complexity weights
- `template_rules` - Auto-add/remove rules
- `audit_logs` / `job_runs` - Operational tables

### Seed Default Data

```bash
# Populate template configurations for all 6 project types
npm run -w server seed
```

Seeds:
- Default crew roles & rates per project type
- Default gear items & rental rates
- Complexity question weights
- Auto-add rules (e.g., add Animator when animations=true)

### View Schema

```bash
# Generate schema visualization
npx drizzle-kit studio

# Opens browser at http://localhost:4983
```

---

## 🧪 Testing

### Run Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Test Coverage

Current tests:
- [shared/pricing/core.test.ts](shared/pricing/core.test.ts) - Pricing engine calculations

To add tests:
```typescript
// Example: server/controllers/__tests__/projects.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Controller', () => {
  it('should create a project', () => {
    // Test implementation
  });
});
```

---

## 📦 Building for Production

### Build Everything

```bash
# Build client + server
npm run build:all
```

This runs:
1. **Client build** (`client/dist/`): Vite bundles React to optimized static files
2. **Server build** (`server/dist/`): esbuild bundles TypeScript to single JS file

### Verify Build Output

```bash
# Check client build
ls -lh client/dist/
# Should show: index.html, assets/ (JS/CSS with content hashes)

# Check server build
ls -lh server/dist/
# Should show: index.js (~59 KB)
```

### Test Production Build Locally

```bash
# Start production server
NODE_ENV=production node server/dist/index.js

# Or use npm script
npm start
```

Server will:
- Bind to `0.0.0.0:3000`
- Serve static files from `client/dist/`
- Handle API requests at `/api/*`
- Fallback all other routes to `client/dist/index.html` (SPA)

Test:
- **Frontend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API**: http://localhost:3000/api/*

---

## 🚀 Deployment

### Render (Recommended for MVP)

Deploy full stack as single service:

```bash
# 1. Ensure render.yaml is committed
git add render.yaml Procfile
git commit -m "Add Render deployment config"
git push

# 2. Create service on Render
# Dashboard → New + → Blueprint
# Select your repo → Apply

# 3. Set environment variables in Render
DATABASE_URL=postgresql://...  # Your Neon URL
NODE_ENV=production
HOST=0.0.0.0
PORT=10000  # Auto-set by Render
```

**Files**:
- [render.yaml](render.yaml) - Service configuration
- [Procfile](Procfile) - Start command

**Deployment Steps**:
1. Push to GitHub/GitLab
2. Connect Render to repository
3. Set `DATABASE_URL` environment variable
4. Deploy automatically on push

See [docs/DEPLOY.md](docs/DEPLOY.md) for detailed instructions.

### Vercel + Render (Split Deployment)

For better performance (frontend on CDN):

**Frontend (Vercel)**:
```bash
cd client
vercel
```

**Backend (Render)**:
Deploy server as API-only service, configure CORS for Vercel domain.

See [docs/DEPLOY.md](docs/DEPLOY.md) for split deployment guide.

---

## 📚 API Documentation

### Base URL
- **Development**: http://localhost:3000/api
- **Production**: https://your-app.onrender.com/api

### Endpoints

#### Health Check
```http
GET /health
```
Returns: `{ "ok": true }`

#### Create Project Estimate
```http
POST /api/projects/estimate
Content-Type: application/json

{
  "type": "company_profile",
  "basic": {
    "durationMin": 120,
    "deliveryDays": 7,
    "flags": { "animations": false, "voiceover": true, "sfx": false },
    "outputs": { "portrait": true, "cut15": true, "cut30": false, "cut60": true },
    "brief": "Company intro video"
  },
  "crew": [
    { "role": "Director/DOP", "qty": 1, "days": 1, "rate": 5000000 }
  ],
  "gear": [
    { "name": "Camera", "qty": 1, "days": 1, "rate": 500000 }
  ],
  "complexity": {
    "answers": [3, 3, 2, 1, 3, 2, 2, 1, 2, 1]
  },
  "contingencyPct": 0.05,
  "profitMarginPct": 0.1
}
```

Returns: Calculated totals, breakdown, and market insights

#### Save Project
```http
POST /api/projects
```
Same payload as estimate, persists to database.

#### Get Project
```http
GET /api/projects/:id
```
Returns: Full project with all line items.

#### Export PDF
```http
POST /api/export/pdf
Content-Type: application/json

{
  "projectId": "uuid",
  "template": "A"
}
```
Returns: PDF file stream

---

## 🛠 Available Scripts

### Root Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start server only (dev mode) |
| `npm run dev:all` | Start client + server concurrently |
| `npm run build` | Build server then client |
| `npm run build:all` | Build client then server |
| `npm start` | Start production server |
| `npm run typecheck` | Type check all workspaces |
| `npm test` | Run unit tests with coverage |
| `npm run db:push` | Push database schema |

### Client Scripts
| Command | Description |
|---------|-------------|
| `npm run -w client dev` | Start Vite dev server (5173) |
| `npm run -w client build` | Build to `client/dist/` |
| `npm run -w client typecheck` | Type check client |

### Server Scripts
| Command | Description |
|---------|-------------|
| `npm run -w server dev` | Start server with tsx watch |
| `npm run -w server build` | Bundle to `server/dist/index.js` |
| `npm run -w server typecheck` | Type check server |
| `npm run -w server seed` | Seed database templates |
| `npm run -w server db:push` | Push schema from server dir |

---

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run type checks: `npm run typecheck`
5. Run tests: `npm test`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Coding Standards

- **TypeScript**: Strict mode enabled
- **Linting**: Follow existing patterns (Prettier pending)
- **Commits**: Use conventional commits (feat, fix, docs, etc.)
- **Testing**: Add tests for new pricing logic

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful UI components
- **Drizzle ORM** - Type-safe database queries
- **Neon** - Serverless PostgreSQL
- **Render** - Simple deployment

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/pricingapp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/pricingapp/discussions)
- **Email**: support@priceright.com

---

## 🗺 Roadmap

- [ ] User authentication & saved clients
- [ ] Multiple quote templates (A, B, C)
- [ ] Advanced market insights with filters
- [ ] Invoice generation & payment links
- [ ] Multi-currency support
- [ ] Branded templates (logo, colors)
- [ ] Export to Excel/CSV
- [ ] Mobile app (React Native)

---

**Built with ❤️ for videographers who value their craft**
