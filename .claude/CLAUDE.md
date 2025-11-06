# PriceRight - Videographer Pricing Tool

## Project Overview
PriceRight is a videographer pricing calculator designed for Indonesian creative professionals. It helps videographers calculate fair project pricing based on complexity, personal goals, crew costs, and market benchmarks.

## Tech Stack
- Frontend: React 18, Vite, TailwindCSS, shadcn/ui
- Backend: Express, Drizzle ORM, PostgreSQL (Neon)
- State Management: Zustand
- Routing: Wouter

## Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
└── agents/          # AI agent configurations
```

## Visual Development

### Design Principles
- Design guidelines documented in `/design_guidelines.md`
- Linear/Notion-inspired aesthetics with professional credibility
- Typography: Inter (primary), JetBrains Mono (numbers)
- Color scheme: Blue primary (#2563eb), neutral grays
- When making visual (front-end, UI/UX) changes, always refer to design_guidelines.md

### Quick Visual Check
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/design_guidelines.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
6. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review
Invoke the `@agent-design-review` subagent for thorough design validation when:
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing

## Coding Standards

### React/TypeScript
- Use functional components with hooks
- Prefer named exports over default exports
- Use TypeScript strict mode
- Follow existing patterns in client/src/

### Styling
- Use Tailwind utility classes
- Follow spacing primitives: 2, 4, 6, 8, 12, 16
- Use shadcn/ui components for consistency
- Responsive: mobile-first approach

### State Management
- Zustand for client state
- React Query for server state
- Keep stores focused and minimal

### File Organization
- Components in client/src/components/
- Pages in client/src/pages/
- Shared types in shared/types/
- API routes in server/routes/

## Project Types
The application supports 6 project types:
1. Company Profile
2. Ads/Commercial
3. Fashion
4. Event Documentation
5. YouTube/Social Media
6. Animation Video

## Database Schema
- `projects` table: Stores quotations and project data
- `market_benchmarks` table: Anonymized pricing data
- Schema defined in shared/types/schema.ts

## Complexity Questions
10 weighted questions determine pricing multipliers:
- Portfolio value, creative complexity, revision risk
- Outsourcing needs, client DIY difficulty
- Company scale, hospitality needs, client type
- Concept ownership, location

## API Endpoints
- POST /api/projects - Create new project
- GET /api/projects - List all projects
- GET /api/projects/:id - Get project details
- POST /api/market-benchmarks - Submit anonymized data

## Development Commands
```bash
npm run dev          # Start dev servers (client + server)
npm run build        # Build for production
npm run typecheck    # Run TypeScript checks
npm test             # Run tests
```

## CI/CD
- GitHub Actions workflow in .github/workflows/ci.yml
- Runs typecheck, tests, and build on push
- Code review agent available via /review command
- Design review agent available via /design-review command
- Security review agent available via /security-review command

## Agent Usage

### Code Review Agent
- Use `/review` command for comprehensive code review
- Follows "Pragmatic Quality" framework
- Focuses on architecture, security, maintainability

### Design Review Agent
- Use `/design-review` command for UI/UX review
- Tests with Playwright across viewports
- Checks accessibility (WCAG 2.1 AA)
- Validates design principles compliance

### Security Review Agent
- Use `/security-review` command for vulnerability scanning
- Based on OWASP Top 10
- High-confidence findings only (80%+ confidence)
- Excludes false positives and theoretical issues
