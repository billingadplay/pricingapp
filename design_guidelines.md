# Design Guidelines: Videographer Pricing Tool

## Design Approach

**Selected Framework:** Design System Approach with Linear/Notion-inspired aesthetics
**Rationale:** This is a utility-focused productivity tool requiring efficiency, clarity, and professional credibility. Drawing from Linear's clean interface and Notion's structured flexibility creates the optimal balance for creative professionals who need systematic pricing workflows.

**Core Design Principles:**
- Frictionless speed: Minimize cognitive load at every step
- Progressive disclosure: Show complexity only when needed
- Professional credibility: Build trust with polished, business-ready outputs
- Visual clarity: Dense information presented elegantly

---

## Typography System

**Font Stack:**
- Primary: Inter (Google Fonts) - exceptional readability for data-heavy interfaces
- Monospace: JetBrains Mono - for pricing numbers and calculations

**Hierarchy:**
- Hero/Page Titles: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-lg font-semibold (18px)
- Body Text: text-base (16px)
- Labels/Metadata: text-sm font-medium (14px)
- Captions/Helper Text: text-xs (12px)
- Price Displays: text-3xl font-bold tabular-nums (30px, monospace)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Section spacing: space-y-6 to space-y-12
- Card gaps: gap-4 or gap-6
- Form field spacing: space-y-4

**Grid System:**
- Container: max-w-7xl mx-auto px-6
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Two-column layouts: grid-cols-1 lg:grid-cols-2 with gap-8
- Form layouts: Single column max-w-2xl for focus

---

## Component Library

### Navigation
- Sidebar navigation (fixed left, 240px width on desktop)
- Top bar with user profile and quick actions
- Breadcrumb navigation for multi-step flows
- Mobile: Bottom tab bar with hamburger menu

### Project Type Selection
- Large clickable cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Icon + title + brief description per template
- Hover state with subtle elevation increase
- Selected state with border accent

### Questionnaire Interface
- Stepper indicator showing progress (minimal, linear dots)
- Question cards with clear Indonesian text
- Rating inputs: Slider controls (1-5 or 1-10 scale) with labeled endpoints
- Single question per screen for mobile, 2-3 stacked for desktop
- "Skip for now" option always visible

### Price Calculator Display
- Prominent price card with clear visual hierarchy
- Base cost vs Recommended price side-by-side comparison
- Breakdown accordion showing calculation factors
- Multiplier badges showing complexity impact
- Market benchmark callout box with aggregated data

### Refinement Panel
- Collapsible sections for optional inputs
- Goal inputs: Number inputs with currency formatting
- Skill level: Segmented control (Beginner/Intermediate/Pro)
- Gear checklist: Multi-select with search

### Quotation Templates
- Gallery view of template previews (3 columns on desktop)
- Live preview pane when template selected
- Customization sidebar for branding elements
- Export button with PDF icon

### Dashboard
- Project cards with thumbnail, title, date, price
- Filter/sort controls (dropdown menus)
- Search bar with icon
- Stats overview cards showing averages and totals

### Forms & Inputs
- Floating labels for text inputs
- Helper text below inputs in muted text
- Validation states: Success (green accent), Error (red with message)
- Number inputs with increment/decrement buttons
- Currency inputs with proper formatting (Rp symbol)

### Data Display
- Tables: Striped rows, hover highlighting, sticky headers
- Price tags: Pill-shaped badges with monospace numbers
- Comparison cards: Side-by-side layouts with dividers
- Timeline views for project history

### Buttons & CTAs
- Primary: Solid fill, rounded-lg, py-3 px-6
- Secondary: Outline style with transparent bg
- Text: No background, underline on hover
- Icon buttons: Square with centered icon, p-2
- Button groups: Connected with rounded edges only on ends

### Overlays
- Modal dialogs: Centered, max-w-2xl, rounded-xl, shadow-2xl
- Slide-over panels: Fixed right, full-height, for editing
- Tooltips: Small, positioned contextually, rounded-md
- Toast notifications: Top-right corner, auto-dismiss

---

## Animations

**Minimal, Purposeful Only:**
- Page transitions: Subtle fade (150ms)
- Card hover: Slight scale (1.02) and shadow increase
- Accordion expand/collapse: Height transition (200ms)
- Button interactions: Quick feedback (100ms)
- NO scroll-triggered animations
- NO elaborate entrance effects

---

## Responsive Behavior

**Breakpoints:**
- Mobile: Base styles (< 768px)
- Tablet: md: (768px+)
- Desktop: lg: (1024px+)

**Key Adaptations:**
- Sidebar collapses to bottom nav on mobile
- Multi-column grids stack to single column
- Side-by-side comparisons stack vertically
- Form inputs go full-width on mobile
- Quotation templates: 3 cols → 2 cols → 1 col

---

## Icons

**Library:** Heroicons (outline for navigation, solid for actions)
**Usage:**
- Navigation items: 20px icons with text labels
- Action buttons: 16px or 20px inline
- Feature cards: 24px centered above text
- Status indicators: 16px inline with text

---

## Images

**Strategic Placement:**
- Hero section: Full-width banner with videographer at work (1920x600px)
  - Overlay gradient for text readability
  - CTA buttons with blurred glass-morphic backgrounds
- Project type cards: Icon illustrations (not photos) 
- Empty states: Simple illustrations for no data scenarios
- PDF quotation header: User's logo placement area (optional upload)

**NO images in:** Forms, calculators, data tables, modals