# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Vite dev server on port 3000 with --host
pnpm build        # Build client (vite) + bundle server (esbuild ESM) into dist/
pnpm start        # Production: NODE_ENV=production node dist/index.js
pnpm preview      # Vite preview server for the built client
pnpm check        # TypeScript type-checking (tsc --noEmit)
pnpm format       # Prettier format all files
```

- Package manager: **pnpm** (v10.4.1).
- There are no test files despite `vitest` being in devDependencies.

## Architecture

This is a **static SPA** for the Paleontological Society of China (中国古生物学会). Stack: React 19, Vite 7, Tailwind CSS 4, shadcn/ui (New York style), wouter for routing, Express for production serving.

### Two-site structure in one codebase

The app serves two conceptual "sub-sites" from a single React app:

1. **Society Main Portal** (学会主站) — public-facing pages: Home (`/`), Intro (`/intro`), Structure (`/structure`), History (`/history`), Gallery (`/gallery`), Announcements (`/society-announcements`), International (`/international`), Downloads (`/downloads-center`), Regulations (`/regulations`), Services (`/services`), Branches (`/branches`).
2. **Party Culture Sub-system** (党建文化) — internal party-building pages under `/party`, plus 12 sub-pages: announcements, organizations, committees, work, activities, team-building, theory-study, dynamics, special-topics, exemplars, reporting, downloads.

### Route layout rules (defined in `PartyLayout.tsx`)

- **Society Home (`/`)** and **Services (`/services`)** render full-width with no sidebar.
- **Party pages** (everything under `/party` plus its 12 child routes) render with a **two-column layout**: left sidebar navigation (shows party nav items) + right main content area.
- **All other pages** (intro, structure, history, gallery, etc.) render full-width with breadcrumbs.
- PartyLayout is the shell for **all pages** — it provides the top nav bar, hero banner, breadcrumbs, sidebar (when applicable), and global footer.

### State: MembershipContext

`MembershipContext` (`client/src/contexts/MembershipContext.tsx`) is the central state hub. It manages:

- **Authentication**: register/login/logout against a mock user DB persisted in `localStorage` under `paleo_user_db`. Demo accounts exist (see `MOCK_USER_DB`). Login/register dialog is `LoginJoinDialog.tsx`.
- **Society membership**: pay society fees → pending → approved/rejected (simulated). Active membership is required to bind branches and attend conferences.
- **Branch binding**: bind/unbind to professional branches (e.g., Vertebrate Paleontology, Palynology). Valid branch IDs are hardcoded in `VALID_BRANCH_IDS`.
- **Conference registrations**: pay conference fees → submit forms → upload abstracts. Conference-to-branch mapping is hardcoded in `getConferenceBranchId`.
- **Notifications**: system notification bell in the top nav, with read/unread tracking.
- All state is persisted per-user in `localStorage` using `paleo_*` prefixed keys.

### Design system: "Strata & Heritage"

The visual identity is documented in `ideas.md` and implemented in `index.css`:

- **Primary**: Strata Deep Blue `#002B49` — nav bar, headers
- **Party Red**: `#C41E3A` — accent borders, buttons, sidebar active states
- **Accent Gold**: `#D9C5A0` — highlights, footer headings
- **Paper Bright**: `#FCFAF7` — page background
- **Fossil Stone**: `#E5E1DA` — borders, card edges
- Custom utilities: `.party-gradient`, `.party-card-border` (3px red top border), `.party-text`, `.xingkai-script` (cursive Chinese font for the logo)
- `border-radius: 0.25rem` (straight, academic edges — not rounded)
- Theme is fixed to `light` mode (not switchable) per `App.tsx`

### Component organization

- `client/src/components/ui/` — shadcn/ui primitives (button, card, dialog, select, table, etc.). Do NOT duplicate — extend these.
- `client/src/components/PartyLayout.tsx` — global layout shell used by all pages
- `client/src/components/LoginJoinDialog.tsx` — auth modal (login/register/forgot-password tabs)
- `client/src/components/Map.tsx` — Google Maps via Manus proxy (no API key needed). Provides `MapView` with `onMapReady` callback. Full Maps JS API (markers, places, geocoding, geometry, directions, layers) available through the proxy at `VITE_FRONTEND_FORGE_API_URL/v1/maps/proxy`.
- `client/src/components/ManusDialog.tsx` — debug/runtime dialog
- `client/src/components/ErrorBoundary.tsx` — class-based React error boundary
- `client/src/contexts/ThemeContext.tsx` — light/dark theme toggle (currently forced to light)
- `client/src/hooks/usePersistFn.ts` — stable function reference hook (alternative to useCallback)
- `client/src/hooks/useMobile.tsx` — mobile breakpoint detection via `use-mobile` pattern
- `client/src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)

### Key patterns and rules

- **Routing**: wouter `Switch`/`Route` in `App.tsx`. Use `<Link href="...">` for navigation. Never nest `<a>` inside `<Link>` — Link already renders an anchor.
- **Icons**: Material Symbols (`material-symbols-outlined` class) for UI chrome; `lucide-react` for component icons.
- **Toasts**: `sonner` only — never add react-toastify or @radix-ui/react-toast.
- **Markdown rendering**: `Streamdown` component from the `streamdown` package.
- **Forms**: `react-hook-form` with `zod` resolvers.
- **Charts**: `recharts` when data visualization is needed.
- **Carousels**: `embla-carousel-react`.
- **Google Fonts**: Add `<link>` tags in `client/index.html` (not via CSS @import).
- **Images/media**: Must be uploaded externally via the Manus CLI; never store large files in `client/public/`. Static assets in `client/public/` are served at root (`/`).
- **`.container`**: Auto-centers + responsive padding (overrides Tailwind default). Use directly — no need for `mx-auto px-*`.
- **`.flex`**: Has `min-width:0` and `min-height:0` by default.
- **Select.Item**: Every `<Select.Item>` must have a non-empty `value` prop.

### Server (production only)

Minimal Express server (`server/index.ts`) that serves the built static files from `dist/public/` and falls back to `index.html` for client-side routing. Port: `PORT` env var or 3000.

### Path aliases

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`
